"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, Shuffle, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { examLabels, type ExamType } from "@/lib/types/common";
import type { Flashcard } from "@/lib/types/flashcard";
import { Result } from "@/components/ui/result";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-3xl sm:p-5">
      {children}
    </section>
  );
}

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
  const [feedback, setFeedback] = useState<"know" | "still-learning" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/flashcards?exam_type=${encodeURIComponent(type)}`)
      .then((response) => response.json() as Promise<Flashcard[]>)
      .then((items) => {
        if (active) {
          setCards(shuffled(items));
          setIndex(0);
          setRevealed(false);
          setRatings({});
          setFinished(false);
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
      if (advanceTimer.current !== null)
        window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const card = cards[index];
  const wrong = cards.filter((item) => ratings[item.id] === false);

  const scramble = () => {
    setCards((current) => shuffled(current));
    setRevealed(false);
    setFeedback(null);
  };
  const restart = () => {
    setCards((current) => shuffled(current));
    setIndex(0);
    setRevealed(false);
    setRatings({});
    setFeedback(null);
    setFinished(false);
  };
  const redoMistakes = () => {
    if (!wrong.length) return;
    setCards(shuffled(wrong));
    setIndex(0);
    setRevealed(false);
    setRatings({});
    setFeedback(null);
    setFinished(false);
  };
  const complete = () => {
    setFinished(true);
  };
  const answer = (isCorrect: boolean) => {
    if (!card || !revealed || feedback) return;
    setRatings((current) => ({ ...current, [card.id]: isCorrect }));
    setFeedback(isCorrect ? "know" : "still-learning");

    fetch(`/api/flashcards/${card.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mastered: isCorrect }),
    }).catch((err) => console.error("Failed to save flashcard progress:", err));

    advanceTimer.current = window.setTimeout(() => {
      setFeedback(null);
      if (index === cards.length - 1) complete();
      else {
        setIndex(index + 1);
        setRevealed(false);
      }
    }, 700);
  };

  if (loading)
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
        <Card>
          <p className="text-sm text-muted-foreground">Loading flashcards...</p>
        </Card>
      </main>
    );
  if (finished)
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
        <Result
          correct={cards.length - wrong.length}
          wrong={wrong.length}
          onTryAgain={restart}
          onRedoMistakes={redoMistakes}
        />
      </main>
    );
  if (!card)
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
        <Card>
          <p className="text-sm text-muted-foreground">
            No flashcards are available for this exam right now.
          </p>
        </Card>
      </main>
    );

  return (
    <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="-ml-1 flex min-h-11 items-center gap-1 px-1 text-sm text-muted-foreground"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <button
          onClick={scramble}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
        >
          <Shuffle className="size-3.5" /> Scramble
        </button>
      </div>
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {examLabels[type]} - Flashcard
        </p>
        <span className="text-xs text-muted-foreground">
          {index + 1} / {cards.length}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>
      {feedback ? (
        <section
          className={`flex min-h-72 items-center justify-center rounded-2xl border p-5 shadow-sm sm:min-h-88 sm:rounded-3xl sm:p-6 ${feedback === "know" ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300"}`}
        >
          <p className="text-3xl font-bold sm:text-4xl">
            {feedback === "know" ? "Know" : "Still learning"}
          </p>
        </section>
      ) : (
        <button
          type="button"
          aria-label={revealed ? "Show front" : "Show back"}
          onClick={() => setRevealed((current) => !current)}
          className="w-full text-left [perspective:1000px]"
        >
          <span
            className={`relative grid transition-transform duration-500 [transform-style:preserve-3d] ${revealed ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <span className="col-start-1 row-start-1 flex min-h-72 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm [backface-visibility:hidden] sm:min-h-88 sm:rounded-3xl sm:p-6">
              <span className="font-mono text-xs uppercase text-primary">
                {card.category}
              </span>
              <span className="mt-6 block text-lg font-semibold leading-7 sm:text-xl sm:leading-8">
                {card.front}
              </span>
              <span className="mt-auto pt-6 text-sm text-muted-foreground">
                Tap card to reveal the answer
              </span>
            </span>
            <span className="col-start-1 row-start-1 flex min-h-72 flex-col rounded-2xl border border-primary/30 bg-card p-5 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] sm:min-h-88 sm:rounded-3xl sm:p-6">
              <span className="flex flex-1 flex-col justify-center">
                <span className="font-mono text-center text-xs uppercase text-primary">
                  Answer
                </span>
                <span className="mt-6 block text-center text-lg font-semibold leading-7 sm:text-xl sm:leading-8">
                  {card.back}
                </span>
              </span>
              <span className="mt-auto pt-6 text-sm text-muted-foreground">
                Tap card to return to the question
              </span>
            </span>
          </span>
        </button>
      )}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-6 sm:gap-8">
          <button
            aria-label="Still learning"
            onClick={() => answer(false)}
            disabled={!revealed || Boolean(feedback)}
            className="flex size-14 items-center justify-center rounded-full border-2 border-rose-500 text-rose-500 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:size-16"
          >
            <X className="size-7 sm:size-8" />
          </button>
          <button
            aria-label="Know"
            onClick={() => answer(true)}
            disabled={!revealed || Boolean(feedback)}
            className="flex size-14 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:size-16"
          >
            <Check className="size-7 sm:size-8" />
          </button>
        </div>

        <button
          onClick={() => {
            if (index > 0) {
              setIndex(index - 1);
              setRevealed(false);
              setFeedback(null);
            }
          }}
          disabled={index === 0 || Boolean(feedback)}
          className="min-h-12 w-full rounded-xl border-2 border-border px-8 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50 xs:w-auto"
        >
          Previous card
        </button>
      </div>
    </main>
  );
}

export function FlashCardPage() {
  return (
    <Suspense fallback={<FlashCardLoading />}>
      <FlashCardContent />
    </Suspense>
  );
}

function FlashCardLoading() {
  return (
    <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
      <Card>
        <p className="text-sm text-muted-foreground">Loading flashcards...</p>
      </Card>
    </main>
  );
}
