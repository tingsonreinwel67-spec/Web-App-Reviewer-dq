# RENEVIEW UI Redesign — Design

Date: 2026-09-04
Branch: `feat/reneview-ui-redesign`

## Goal

Replace the current mobile-style reviewer UI with the RENEVIEW design shown in the
supplied mockups, add a working forgot-password flow, lock the Practice Exam entry
point when the user is not eligible, and add motivational feedback to answering.
All new state is persisted in Postgres.

## Scope

In scope:

- Visual system rewrite (single committed light theme).
- Persistent top navigation shell: Dashboard, Flashcards, Memorize, Glossary, Analytics.
- Redesign of Dashboard, Flashcards, Memorize, Practice Exam.
- New Glossary and Analytics screens.
- Admin console backed by real data only.
- Forgot-password and reset-password flows.
- Practice Exam lock state driven by eligibility.
- Motivation: DB-backed streaks, encouragement messages, confetti, session mastery panel.

Out of scope:

- Cohorts, enrolled-track assignment, scheduled exam dates (no data backs them).
- Question bank CRUD and exam analytics admin sub-screens.
- Sending real reset emails (delivery is a single swappable function).

## Visual system

`src/app/globals.css` is rewritten around the mockup palette:

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#FBF7EE` | Page ground |
| `--card` | `#FFFFFF` | Cards, panels |
| `--border` | `#EAE3D2` | Hairline warm borders |
| `--secondary` | `#0B2340` | Navy headers, action bars |
| `--primary` | `#FFD400` | Yellow accent, primary buttons |
| `--muted-foreground` | `#5B6472` | Secondary text |

Radii tighten from `rounded-3xl` to ~10px to match the mockups. Typeface stays
Hanken Grotesk.

The existing dark/light toggle is removed: `.dark` and `.light` currently define
identical values, so the control has no visible effect. The mockups commit to a
single light theme.

## Routes

| Route | Status | Notes |
| --- | --- | --- |
| `/` | existing | Login. Already on-brand; links to `/forgot-password`. |
| `/signup` | existing | Restyled to match. |
| `/forgot-password` | new | Request a reset link. |
| `/reset-password` | new | Consume a reset token. |
| `/dashboard` | rewritten | Exam Tracks + Quick Access. |
| `/learningMethods/flashCard` | rewritten | Flip card review. |
| `/learningMethods/memorization` | rewritten | Two-column quiz + mastery sidebar. |
| `/learningMethods/practiceExam` | rewritten | Restyled; endpoint bugs fixed. |
| `/glossary` | new | Searchable term grid. |
| `/analytics` | new | Per-track mastery donuts and bars. |
| `/admin` | new | Reviewee directory, ADMIN/MANAGER only. |

## Data model changes

Two new tables, created idempotently by `scripts/migrate.cjs`.

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_streaks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type      exam_type NOT NULL,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak    integer NOT NULL DEFAULT 0,
  last_answer_at timestamptz,
  UNIQUE (user_id, exam_type)
);
```

The migration also inserts one example `vocabulary_terms` row so the Glossary has
real data to render.

## API changes

New:

- `POST /api/auth/forgot-password` — always responds 200 with a generic message so
  the endpoint cannot be used to enumerate accounts. On a match it stores a
  SHA-256 hash of a 32-byte random token with a 1-hour expiry. Outside production
  the response includes `resetUrl` so the flow is testable without a mailer.
- `POST /api/auth/reset-password` — verifies hash, expiry and single use, then
  bcrypt-writes the new password and marks the token used.
- `GET /api/attempts/eligibility?exam_type=` — returns
  `{ eligible, flashcards: { mastered, total }, memorization: { mastered, total } }`
  in one round trip. The existing `POST` on that route (start attempt) is unchanged.
- `GET /api/glossary` — vocabulary terms, optionally filtered by `exam_type` and query.
- `GET /api/streaks` — the caller's streaks per exam type.
- `GET /api/admin/reviewees` — roster rows for the admin console.

Modified:

- `POST /api/flashcards/[id]/progress` and `POST /api/memorization/[id]/progress`
  additionally update `study_streaks` in the same request and return the new
  `{ current_streak, best_streak, is_new_best }`, so answering costs one round trip.

Bug fix: `PracticeExamPage` calls `/api/exam-attempts`, `/api/exam-attempts/{id}/answers`
and `/api/exam-attempts/{id}/complete`. Those routes do not exist — the real ones are
under `/api/attempts/`. Exam submission is currently broken; the redesign corrects the
paths.

`src/middleware.ts` gains matchers for `/glossary`, `/analytics`, `/admin`, and the
new API paths. `/admin` is already role-gated to ADMIN in `auth.config.ts`.

## Practice Exam lock

Eligibility means every flashcard and every memorization item for that exam type is
mastered — the rule already enforced server-side in `api/attempts/eligibility`.

The Dashboard fetches eligibility per track and renders the Practice Exam button in
one of two states:

- Eligible: yellow-outlined button, navigates to the exam.
- Locked: muted, non-interactive, lock icon, plus a reason line naming what remains,
  e.g. "Finish flashcards (18/40) and memorize (12/40) to unlock."

The lock is presentation only. The server keeps rejecting ineligible attempts with
403, so the UI state cannot be bypassed by navigating directly.

## Motivation

- **Streaks** — consecutive correct answers per user per track, persisted in
  `study_streaks`. A correct answer increments and may raise `best_streak`; a wrong
  answer resets `current_streak` to 0. `best_streak` never decreases.
- **Encouragement** — `src/lib/motivation.ts` holds message pools. Correct answers
  draw from a praise pool, escalating at streak milestones (5, 10, 25). Wrong answers
  draw from a supportive pool and always show the correct answer.
- **Confetti** — CSS-only burst on correct answers and milestones. No new dependency.
- **Session Mastery** — live accuracy percentage and average time per card, computed
  from session-local state, matching the Memorize mockup sidebar.

## Admin console

Backed by an extension of the existing `/api/user` aggregate query. Columns are
limited to what the database actually holds: candidate (name, email, id), derived
track, overall readiness, flashcard mastery, memorize accuracy, mock exam average
from `exam_attempts`, streak and last activity, and status.

Status thresholds: Exam Ready at readiness 90 or above, On Track at 70 or above,
At Risk below 70. These live in `src/lib/readiness.ts` so they are testable and
defined in one place.

Cohort badges, batch labels and scheduled exam dates from the mockup are omitted —
no column backs them.

## Testing

The repository has no test runner. Vitest is added and covers the pure logic:

- streak transitions (increment, reset, best-streak monotonicity)
- eligibility derivation from mastery counts, including the zero-items case
- readiness status thresholds at their boundaries
- reset-token hashing, expiry and single-use rules

Screens are verified by running the dev server and driving it in a browser.
Visual styling is not unit-tested.

## Risks

- The redesign touches every screen at once; regressions are caught by building the
  project and walking each route in a browser before the branch is offered for review.
- `study_streaks` uses the existing `exam_type` enum. If that enum gains values later,
  the table follows automatically.
- Reset tokens are only useful in development until a mailer is wired up. The
  forgot-password page states this explicitly outside production.
