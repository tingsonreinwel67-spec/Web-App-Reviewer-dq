// app/learningMethods/memorization/memorization-client.tsx
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronLeft, Shuffle } from "lucide-react";
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
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-3xl sm:p-5">
      {children}
    </section>
  );
}

function MemorizationContent() {
  const searchParams = useSearchParams();
  const type: ExamType =
    searchParams.get("exam_type") === "TRADITIONAL_LIFE"
      ? "TRADITIONAL_LIFE"
      : "VUL";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const advanceTimer = useRef<number | null>(null);
  const answering = useRef(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/memorization?exam_type=${encodeURIComponent(type)}`)
      .then((response) => response.json() as Promise<Question[]>)
      .then((items) => {
        if (active) {
          setQuestions(shuffled(items));
          setIndex(0);
          setSelected(null);
          setChecked(false);
          setWrong([]);
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
  const correct = question?.choices.find((choice) => choice.is_correct)?.id;
  const questionParts = question ? splitQuestion(question.text) : null;
  const scramble = () => {
    if (advanceTimer.current !== null)
      window.clearTimeout(advanceTimer.current);
    answering.current = false;
    setQuestions((current) => shuffled(current));
    setSelected(null);
    setChecked(false);
  };
  const restart = () => {
    if (advanceTimer.current !== null)
      window.clearTimeout(advanceTimer.current);
    answering.current = false;
    setQuestions((current) => shuffled(current));
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setWrong([]);
    setFinished(false);
  };
  const redoMistakes = () => {
    if (!wrong.length) return;
    setQuestions(shuffled(wrong));
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setWrong([]);
    setFinished(false);
  };
  const complete = () => {
    setFinished(true);
  };
  const answer = (choiceId: string) => {
    if (!question || !correct || answering.current) return;
    answering.current = true;
    const isCorrect = choiceId === correct;
    const updatedWrong = isCorrect
      ? wrong.filter((item) => item.id !== question.id)
      : wrong.some((item) => item.id === question.id)
        ? wrong
        : [...wrong, question];
    setSelected(choiceId);
    setChecked(true);
    setWrong(updatedWrong);

    // persist to backend — fire and forget
    fetch(`/api/memorization/${question.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selected_choice_id: choiceId,
        is_correct: isCorrect,
        mastered: isCorrect,
      }),
    }).catch((err) =>
      console.error("Failed to save memorization progress:", err),
    );

    advanceTimer.current = window.setTimeout(() => {
      answering.current = false;
      if (index === questions.length - 1) complete();
      else {
        setIndex(index + 1);
        setSelected(null);
        setChecked(false);
      }
    }, 900);
  };

  if (loading)
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
        <Card>
          <p className="text-sm text-muted-foreground">Loading questions...</p>
        </Card>
      </main>
    );
  if (finished)
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
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
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
        <Card>
          <p className="text-sm text-muted-foreground">
            No questions are available for this exam right now.
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
          {examLabels[type]} - Memorization
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
      <Card>
        <p className="font-mono text-xs uppercase text-primary">
          {question.category}
        </p>
        <h1 className="mt-6 text-lg font-semibold leading-7 sm:text-xl sm:leading-8">
          {questionParts?.prompt}
        </h1>
        {questionParts && questionParts.statements.length > 0 && (
          <div className="mt-5 flex flex-col gap-2">
            {questionParts.statements.map((statement) => (
              <p
                key={statement}
                className="rounded-xl bg-muted/40 px-3 py-3 text-sm leading-6 sm:px-4"
              >
                {statement}
              </p>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3">
          {question.choices.map((choice, choiceIndex) => {
            const choiceState =
              checked &&
              (choice.id === correct
                ? "correct"
                : choice.id === selected
                  ? "incorrect"
                  : "");
            return (
              <button
                key={choice.id}
                type="button"
                disabled={checked}
                onClick={() => answer(choice.id)}
                className={`flex min-h-12 w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors disabled:cursor-default sm:px-4 ${choiceState === "correct" ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : choiceState === "incorrect" ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300" : "border-border hover:bg-muted"}`}
              >
                <span className="shrink-0 pt-0.5 font-mono text-xs">
                  {String.fromCharCode(65 + choiceIndex)}
                </span>
                <span className="min-w-0 flex-1">{choice.text}</span>
              </button>
            );
          })}
          {checked && (
            <p
              className={`text-sm font-semibold ${selected === correct ? "text-emerald-500" : "text-rose-500"}`}
            >
              {selected === correct
                ? "Correct"
                : "Incorrect — the correct answer is highlighted."}
            </p>
          )}
        </div>
      </Card>
    </main>
  );
}

export function MemorizationPage() {
  return (
    <Suspense fallback={<MemorizationLoading />}>
      <MemorizationContent />
    </Suspense>
  );
}

function MemorizationLoading() {
  return (
    <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
      <Card>
        <p className="text-sm text-muted-foreground">Loading questions...</p>
      </Card>
    </main>
  );
}
