"use client";

import { AppNav } from "@/components/ui/app-nav";
import { AnswerFeedback, Confetti, StreakBadge } from "@/components/ui/motivation";
import { Result } from "@/components/ui/result";
import { motivationFor, type MotivationMessage } from "@/lib/motivation";
import { splitStatements } from "@/lib/question-text";
import { examLabels, type ExamType } from "@/lib/types/common";
import type { Flashcard } from "@/lib/types/flashcard";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Shuffle,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const trackTitles: Record<ExamType, string> = {
  VUL: "VUL Track Review",
  TRADITIONAL_LIFE: "Traditional Life Review",
};

function FlashCardContent() {
  const searchParams = useSearchParams();
  const type: ExamType =
    searchParams.get("exam_type") === "TRADITIONAL_LIFE"
      ? "TRADITIONAL_LIFE"
      : "VUL";

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [message, setMessage] = useState<MotivationMessage | null>(null);
  const [celebration, setCelebration] = useState(0);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch(`/api/flashcards?exam_type=${encodeURIComponent(type)}`).then(
        (response) => response.json() as Promise<Flashcard[]>,
      ),
      fetch("/api/streaks")
        .then((response) => response.json())
        .catch(() => []),
    ])
      .then(([items, streaks]) => {
        if (!active) return;
        setCards(shuffled(Array.isArray(items) ? items : []));
        setIndex(0);
        setRevealed(false);
        setRatings({});
        setFinished(false);

        const mine = Array.isArray(streaks)
          ? streaks.find(
              (row: { exam_type: ExamType }) => row.exam_type === type,
            )
          : null;
        if (mine) {
          setStreak({ current: mine.current_streak, best: mine.best_streak });
        }
      })
      .catch(() => active && setCards([]))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [type]);

  useEffect(
    () => () => {
      if (advanceTimer.current !== null) {
        window.clearTimeout(advanceTimer.current);
      }
    },
    [],
  );

  const card = cards[index];
  const wrong = cards.filter((item) => ratings[item.id] === false);
  const front = splitStatements(card?.front ?? "");
  const back = splitStatements(card?.back ?? "");

  /** Step between cards without rating the current one. */
  const move = (step: number) => {
    if (message) return;
    const next = index + step;
    if (next < 0 || next > cards.length - 1) return;
    setIndex(next);
    setRevealed(false);
  };

  const resetSession = (nextCards: Flashcard[]) => {
    setCards(nextCards);
    setIndex(0);
    setRevealed(false);
    setRatings({});
    setFinished(false);
    setMessage(null);
  };

  const answer = async (isCorrect: boolean) => {
    if (!card || !revealed || message) return;

    setRatings((current) => ({ ...current, [card.id]: isCorrect }));

    const optimistic = isCorrect ? streak.current + 1 : 0;
    setStreak((current) => ({
      current: optimistic,
      best: Math.max(current.best, optimistic),
    }));
    setMessage(motivationFor(isCorrect, optimistic, index));
    if (isCorrect) setCelebration((run) => run + 1);

    advanceTimer.current = window.setTimeout(() => {
      setMessage(null);
      if (index === cards.length - 1) setFinished(true);
      else {
        setIndex((current) => current + 1);
        setRevealed(false);
      }
    }, 1200);

    try {
      const response = await fetch(`/api/flashcards/${card.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mastered: isCorrect }),
      });
      const data = await response.json();
      if (data?.streak) {
        setStreak({ current: data.streak.current, best: data.streak.best });
      }
    } catch (error) {
      console.error("Failed to save flashcard progress:", error);
    }
  };

  if (loading) {
    return <Shell type={type}>Loading flashcards…</Shell>;
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav />
        <main className="rv-shell max-w-2xl py-10">
          <Result
            correct={cards.length - wrong.length}
            wrong={wrong.length}
            onTryAgain={() => resetSession(shuffled(cards))}
            onRedoMistakes={
              wrong.length ? () => resetSession(shuffled(wrong)) : undefined
            }
          />
        </main>
      </div>
    );
  }

  if (!card) {
    return (
      <Shell type={type}>
        No flashcards are available for this track right now.
      </Shell>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="rv-shell max-w-3xl py-10 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <StreakBadge
              current={streak.current}
              best={streak.best}
              pulse={message?.mood === "correct"}
            />
          </div>
          <button
            onClick={() => {
              setCards((current) => shuffled(current));
              setIndex(0);
              setRevealed(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold transition hover:border-[#C9A227]"
          >
            <Shuffle className="size-3.5" /> Shuffle
          </button>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold md:text-5xl">
          {trackTitles[type]}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Master core concepts with active recall.
        </p>

        <div className="relative mt-8">
          <Confetti
            active={message?.mood === "correct"}
            runId={celebration}
            pieces={message?.milestone ? 34 : 20}
          />

          <button
            type="button"
            aria-label={revealed ? "Show question" : "Reveal answer"}
            onClick={() => setRevealed((current) => !current)}
            className="w-full [perspective:1200px]"
          >
            <span
              className={`relative grid transition-transform duration-500 [transform-style:preserve-3d] ${
                revealed ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <span className="rv-card col-start-1 row-start-1 flex min-h-[320px] flex-col items-center justify-center gap-5 p-10 [backface-visibility:hidden]">
                <HelpCircle className="size-7 text-[#C9A227]" />

                {front.prompt && (
                  <span className="block text-2xl font-extrabold leading-9">
                    {front.prompt}
                  </span>
                )}

                {/* Enumerated statements read as a list, not as one paragraph
                    run together with the question. */}
                {front.statements.length > 0 && (
                  <span className="flex w-full flex-col gap-2.5 text-left">
                    {front.statements.map((statement) => (
                      <span
                        key={statement}
                        className="block rounded-lg bg-muted px-4 py-3 text-lg font-semibold leading-8"
                      >
                        {statement}
                      </span>
                    ))}
                  </span>
                )}

                <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                  Tap to reveal answer
                </span>
              </span>

              <span className="col-start-1 row-start-1 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl bg-[#FFD400] p-10 text-[#0B2340] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {back.prompt && (
                  <span className="block text-2xl font-bold leading-9">
                    {back.prompt}
                  </span>
                )}

                {back.statements.length > 0 && (
                  <span className="flex w-full flex-col gap-2.5 text-left">
                    {back.statements.map((statement) => (
                      <span
                        key={statement}
                        className="block rounded-lg bg-[#0B2340]/10 px-4 py-3 text-xl font-semibold leading-8"
                      >
                        {statement}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8">
          <button
            aria-label="Still learning"
            onClick={() => answer(false)}
            disabled={!revealed || Boolean(message)}
            className="flex size-14 items-center justify-center rounded-full border-2 border-rose-400 text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <X className="size-6" />
          </button>

          <span className="text-sm font-semibold text-muted-foreground">
            Card {index + 1} of {cards.length}
          </span>

          <button
            aria-label="I know this"
            onClick={() => answer(true)}
            disabled={!revealed || Boolean(message)}
            className="flex size-14 items-center justify-center rounded-full border-2 border-[#C9A227] text-[#8A6D0B] transition hover:bg-[#FFD400] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Check className="size-6" />
          </button>
        </div>

        {/* Step through the deck without rating a card either way. */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => move(-1)}
            disabled={index === 0 || Boolean(message)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-bold transition hover:border-[#C9A227] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
          <button
            onClick={() => move(1)}
            disabled={index === cards.length - 1 || Boolean(message)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-bold transition hover:border-[#C9A227] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>

        {message && (
          <div className="mx-auto mt-6 max-w-md text-left">
            <AnswerFeedback message={message} />
          </div>
        )}
      </main>
    </div>
  );
}

function Shell({
  type,
  children,
}: {
  type: ExamType;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <main className="rv-shell max-w-3xl py-12 text-center">
        <h1 className="text-4xl font-extrabold">{trackTitles[type]}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{children}</p>
        <p className="mt-1 text-xs text-muted-foreground">{examLabels[type]}</p>
      </main>
    </div>
  );
}

export function FlashCardPage() {
  return (
    <Suspense fallback={<Shell type="VUL">Loading flashcards…</Shell>}>
      <FlashCardContent />
    </Suspense>
  );
}
