"use client";

import { AppNav } from "@/components/ui/app-nav";
import { Invite } from "@/components/ui/invite";
import {
  readinessStatus,
  statusLabels,
  statusStyles,
  type ReadinessStatus,
} from "@/lib/readiness";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  LoaderCircle,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Reviewee = {
  id: string;
  name: string;
  email: string;
  readiness: number;
  status: ReadinessStatus;
  flashcards: { mastered: number; total: number };
  memorize: { mastered: number; total: number; accuracy: number };
  practice: { mastered: number; total: number };
  mockExam: { taken: number; passed: number; average: number | null };
  streak: { current: number; best: number; lastActivity: string | null };
};

const PAGE_SIZE = 15;

const sorts = {
  readiness_desc: "Overall Readiness (High to Low)",
  readiness_asc: "Overall Readiness (Low to High)",
  name_asc: "Name (A-Z)",
} as const;

type SortKey = keyof typeof sorts;

function relativeTime(value: string | null) {
  if (!value) return "No activity yet";

  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `Active ${Math.max(1, minutes)}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;

  const days = Math.round(hours / 24);
  return `Inactive ${days}d`;
}

function SummaryTile({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <div className="rv-card flex items-center justify-between p-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-3xl font-extrabold">
          {value}
          {hint && (
            <span className="ml-1.5 text-sm font-semibold text-muted-foreground">
              {hint}
            </span>
          )}
        </p>
      </div>
      <span
        className={`flex size-10 items-center justify-center rounded-lg ${tone}`}
      >
        <Icon className="size-5" />
      </span>
    </div>
  );
}

function Meter({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-[#EFEAE0]">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: tone }}
      />
    </div>
  );
}

/**
 * Removing a reviewee destroys their history, so it takes a deliberate second
 * click naming the person rather than a single trash icon.
 */
function RemoveReviewee({
  reviewee,
  onRemoved,
}: {
  reviewee: Reviewee;
  onRemoved: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setRemoving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/reviewees/${reviewee.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Could not remove this reviewee.");
        setRemoving(false);
        return;
      }

      onRemoved(reviewee.id);
    } catch {
      setError("Could not reach the server.");
      setRemoving(false);
    }
  }

  if (confirming) {
    return (
      <div className="min-w-[190px]">
        <p className="text-xs font-semibold">
          Remove {reviewee.name} and all their progress?
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={remove}
            disabled={removing}
            className="flex items-center gap-1.5 rounded-lg bg-destructive px-2.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {removing && <LoaderCircle className="size-3 animate-spin" />}
            {removing ? "Removing…" : "Yes, remove"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={removing}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold transition hover:border-[#C9A227]"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      aria-label={`Remove ${reviewee.name}`}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
    >
      <Trash2 className="size-3.5" />
      Remove
    </button>
  );
}

export function AdminPage() {
  const [roster, setRoster] = useState<Reviewee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadinessStatus | "ALL">(
    "ALL",
  );
  const [sort, setSort] = useState<SortKey>("readiness_desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/reviewees")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load");
        return data as Reviewee[];
      })
      .then((data) => active && setRoster(data))
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      total: roster.length,
      ready: roster.filter((row) => row.status === "EXAM_READY").length,
      onTrack: roster.filter((row) => row.status === "ON_TRACK").length,
      atRisk: roster.filter((row) => row.status === "AT_RISK").length,
    }),
    [roster],
  );

  const visible = useMemo(() => {
    const filtered =
      statusFilter === "ALL"
        ? roster
        : roster.filter((row) => row.status === statusFilter);

    return [...filtered].sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "readiness_asc") return a.readiness - b.readiness;
      return b.readiness - a.readiness;
    });
  }, [roster, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const share = (part: number) =>
    counts.total ? `${((part / counts.total) * 100).toFixed(1)}%` : "0%";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="mx-auto w-full max-w-[1500px] px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold">
                Reviewee Directory &amp; Cohort Roster
              </h1>
              <span className="rounded-full bg-[#0B2340] px-3 py-1 text-xs font-bold text-[#FFD400]">
                {counts.total} Candidates
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Live performance tracking of every candidate across licensing
              tracks.
            </p>
          </div>

          <Invite />
        </div>

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          >
            {notice}
          </p>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryTile
            label="Total Reviewees"
            value={counts.total}
            icon={Users}
            tone="bg-muted text-[#0B2340]"
          />
          <SummaryTile
            label="Exam Ready"
            value={counts.ready}
            hint={`(${share(counts.ready)})`}
            icon={CheckCircle2}
            tone="bg-emerald-50 text-emerald-700"
          />
          <SummaryTile
            label="On Track"
            value={counts.onTrack}
            hint={`(${share(counts.onTrack)})`}
            icon={Zap}
            tone="bg-amber-50 text-amber-700"
          />
          <SummaryTile
            label="At Risk / Nudge"
            value={counts.atRisk}
            hint={`(${share(counts.atRisk)})`}
            icon={AlertTriangle}
            tone="bg-rose-50 text-rose-700"
          />
        </div>

        <div className="rv-card mt-6 flex flex-wrap items-end gap-6 p-5">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Readiness Status
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ReadinessStatus | "ALL");
                setPage(1);
              }}
              className="mt-1.5 block w-56 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-[#0B2340]"
            >
              <option value="ALL">All Statuses</option>
              <option value="EXAM_READY">Exam Ready</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Sort Candidates By
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="mt-1.5 block w-64 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-[#0B2340]"
            >
              {Object.entries(sorts).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            {(["AT_RISK", "ON_TRACK", "EXAM_READY"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(statusFilter === status ? "ALL" : status);
                  setPage(1);
                }}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                  statusFilter === status
                    ? "border-[#0B2340] bg-[#0B2340] text-white"
                    : statusStyles[status]
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Loading roster…
          </p>
        ) : error ? (
          <p className="mt-8 text-sm font-semibold text-destructive">{error}</p>
        ) : rows.length === 0 ? (
          <div className="rv-card mt-6 p-10 text-center">
            <p className="font-bold">No candidates match these filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {roster.length === 0
                ? "No reviewees have been registered yet."
                : "Try clearing the status filter."}
            </p>
          </div>
        ) : (
          <div className="rv-card mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-[#0B2340] text-white">
                  <tr>
                    {[
                      "Reviewee / Candidate",
                      "Overall Readiness",
                      "Flashcards Mastery",
                      "Memorize Acc.",
                      "Mock Exam Avg",
                      "Streak & Activity",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-4 text-[11px] font-bold uppercase tracking-wide"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-border align-top"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold">{row.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {row.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold">{row.readiness}%</span>
                          <span className="text-xs text-muted-foreground">
                            {statusLabels[readinessStatus(row.readiness)]}
                          </span>
                        </div>
                        <Meter
                          value={row.readiness}
                          tone={
                            row.status === "AT_RISK" ? "#E11D48" : "#FFD400"
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {row.flashcards.mastered} / {row.flashcards.total}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {row.flashcards.total
                            ? Math.round(
                                (row.flashcards.mastered /
                                  row.flashcards.total) *
                                  100,
                              )
                            : 0}
                          % completed
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {row.memorize.accuracy}%
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {row.mockExam.average === null
                            ? "—"
                            : `${row.mockExam.average}% Avg`}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {row.mockExam.taken === 0
                            ? "No mocks taken"
                            : `Passed ${row.mockExam.passed}/${row.mockExam.taken}`}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="flex items-center gap-1.5 font-semibold">
                          <Flame
                            className={`size-3.5 ${
                              row.streak.current > 0
                                ? "text-[#C98A00]"
                                : "text-muted-foreground"
                            }`}
                          />
                          {row.streak.current} day streak
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {relativeTime(row.streak.lastActivity)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[row.status]}`}
                        >
                          {statusLabels[row.status]}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <RemoveReviewee
                          reviewee={row}
                          onRemoved={(id) => {
                            setRoster((current) =>
                              current.filter((item) => item.id !== id),
                            );
                            setNotice(`${row.name} has been removed.`);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm">
              <p className="text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(currentPage * PAGE_SIZE, visible.length)} of{" "}
                {visible.length} reviewees
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 font-semibold">
                  {currentPage} / {pageCount}
                </span>
                <button
                  onClick={() =>
                    setPage((current) => Math.min(pageCount, current + 1))
                  }
                  disabled={currentPage === pageCount}
                  className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
