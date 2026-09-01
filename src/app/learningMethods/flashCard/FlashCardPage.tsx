// app/learningMethods/flashCard/flash-card-client.tsx
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, Shuffle, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { examLabels, type ExamType } from "@/lib/types/common";
import type { Question } from "@/lib/types/questions";
import { Result } from "@/components/ui/result";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function splitQuestion(text: string) {
  const matches = [...text.matchAll(/(?:^|\s)([IVXLCDM]+\.)\s*/g)];
  if (!matches.length) return { prompt: text, statements: [] as string[] };

  const starts = matches.map(
    (match) => (match.index ?? 0) + match[0].indexOf(match[1]),
  );
  return {
    prompt: text.slice(0, starts[0]).trim(),
    statements: starts.map((start, index) =>
      text.slice(start, starts[index + 1]).trim(),
    ),
  };
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
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
  const [questions, setQuestions] = useState<Question[]>([]);
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
    fetch(`/api/questions?exam_type=${encodeURIComponent(type)}`)
      .then((response) => response.json() as Promise<Question[]>)
      .then((items) => {
        if (active) {
          setQuestions(shuffled(items));
          setIndex(0);
          setRevealed(false);
          setRatings({});
          setFinished(false);
        }
      })
      .catch(() => active && setQuestions([]))
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

  const question = questions[index];
  const questionParts = question ? splitQuestion(question.text) : null;
  const wrong = questions.filter((item) => ratings[item.id] === false);
  const scramble = () => {
    setQuestions((current) => shuffled(current));
    setRevealed(false);
    setFeedback(null);
  };
  const restart = () => {
    setQuestions((current) => shuffled(current));
    setIndex(0);
    setRevealed(false);
    setRatings({});
    setFeedback(null);
    setFinished(false);
  };
  const redoMistakes = () => {
    if (!wrong.length) return;
    setQuestions(shuffled(wrong));
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
    if (!question || !revealed || feedback) return;
    setRatings((current) => ({ ...current, [question.id]: isCorrect }));
    setFeedback(isCorrect ? "know" : "still-learning");

    // persist to backend — fire and forget, don't block the UI transition
    fetch(`/api/flashcards/${question.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mastered: isCorrect }),
    }).catch((err) => console.error("Failed to save flashcard progress:", err));

    advanceTimer.current = window.setTimeout(() => {
      setFeedback(null);
      if (index === questions.length - 1) complete();
      else {
        setIndex(index + 1);
        setRevealed(false);
      }
    }, 700);
  };

  if (loading)
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10">
        <Card>
          <p className="text-sm text-muted-foreground">Loading questions...</p>
        </Card>
      </main>
    );
  if (finished)
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10">
        <Result
          correct={questions.length - wrong.length}
          wrong={wrong.length}
          onTryAgain={restart}
          onRedoMistakes={redoMistakes}
        />
      </main>
    );
  if (!question)
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10">
        <Card>
          <p className="text-sm text-muted-foreground">
            No questions are available for this exam right now.
          </p>
        </Card>
      </main>
    );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-10">
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <button
          onClick={scramble}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
        >
          <Shuffle className="size-3.5" /> Scramble
        </button>
      </div>
      <div className="flex justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {examLabels[type]} - Flashcard
        </p>
        <span className="text-xs text-muted-foreground">
          {index + 1} / {questions.length}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>
      {feedback ? (
        <section
          className={`flex min-h-88 items-center justify-center rounded-3xl border p-6 shadow-sm ${feedback === "know" ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300"}`}
        >
          <p className="text-4xl font-bold">
            {feedback === "know" ? "Know" : "Still learning"}
          </p>
        </section>
      ) : (
        <button
          type="button"
          aria-label={revealed ? "Show question" : "Show answer"}
          onClick={() => setRevealed((current) => !current)}
          className="w-full text-left perspective-distant"
        >
          <span
            className={`relative grid transition-transform duration-500 transform-3d ${revealed ? "transform-rotateY(180deg)" : ""}`}
          >
            <span className="col-start-1 row-start-1 flex min-h-88 flex-col rounded-3xl border border-border bg-card p-6 shadow-sm backface-hidden">
              <span className="font-mono text-xs uppercase text-primary">
                {question.category}
              </span>
              <span className="mt-6 block text-xl font-semibold leading-8">
                {questionParts?.prompt}
              </span>
              {questionParts && questionParts.statements.length > 0 && (
                <span className="mt-5 flex flex-col gap-2">
                  {questionParts.statements.map((statement) => (
                    <span
                      key={statement}
                      className="rounded-xl bg-muted/40 px-4 py-3 text-sm font-normal leading-6"
                    >
                      {statement}
                    </span>
                  ))}
                </span>
              )}
              <span className="mt-auto pt-6 text-sm text-muted-foreground">
                Tap card to reveal the answer
              </span>
            </span>
            <span className="col-start-1 row-start-1 flex min-h-88 flex-col rounded-3xl border border-primary/30 bg-card p-6 shadow-sm backface-hidden transform-rotateY(180deg)">
              <span className="flex flex-1 flex-col justify-center">
                <span className="font-mono text-center text-xs uppercase text-primary">
                  Answer
                </span>
                <span className="mt-6 block text-center text-xl font-semibold leading-8">
                  {question.choices.find((choice) => choice.is_correct)?.text}
                </span>
                {question.explanation && (
                  <span className="mt-6 block rounded-2xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
                    {question.explanation}
                  </span>
                )}
              </span>
              <span className="mt-auto pt-6 text-sm text-muted-foreground">
                Tap card to return to the question
              </span>
            </span>
          </span>
        </button>
      )}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-8">
          <button
            aria-label="Still learning"
            onClick={() => answer(false)}
            disabled={!revealed || Boolean(feedback)}
            className="flex size-16 items-center justify-center rounded-full border-2 border-rose-500 text-rose-500 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="size-8" />
          </button>
          <button
            aria-label="Know"
            onClick={() => answer(true)}
            disabled={!revealed || Boolean(feedback)}
            className="flex size-16 items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="size-8" />
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
          className="rounded-xl border-2 border-border px-8 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
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
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10">
      <Card>
        <p className="text-sm text-muted-foreground">Loading questions...</p>
      </Card>
    </main>
  );
}
