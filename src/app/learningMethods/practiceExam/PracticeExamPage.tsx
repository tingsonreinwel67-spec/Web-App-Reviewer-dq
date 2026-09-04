// app/learningMethods/practiceExam/practice-exam-client.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { examLabels, type ExamType } from "@/lib/types/common";
import type { Question } from "@/lib/types/questions";
import { Result } from "@/components/ui/result";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-3xl sm:p-5">
      {children}
    </section>
  );
}

function PracticeExamContent() {
  const searchParams = useSearchParams();
  const type: ExamType =
    searchParams.get("exam_type") === "TRADITIONAL_LIFE"
      ? "TRADITIONAL_LIFE"
      : "VUL";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<Question["id"], string>>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [flashcardElig, memoElig] = await Promise.all([
          fetch(
            `/api/flashcards/eligibility?exam_type=${encodeURIComponent(type)}`,
          ).then((r) => r.json()),
          fetch(
            `/api/memorization/eligibility?exam_type=${encodeURIComponent(type)}`,
          ).then((r) => r.json()),
        ]);

        if (!active) return;

        if (!flashcardElig.eligible || !memoElig.eligible) {
          setLocked(true);
          setLoading(false);
          return;
        }

        const [items, attempt] = await Promise.all([
          fetch(`/api/questions?exam_type=${encodeURIComponent(type)}`).then(
            (r) => r.json() as Promise<Question[]>,
          ),
          fetch(`/api/exam-attempts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exam_type: type }),
          }).then((r) => r.json()),
        ]);

        if (active) {
          setQuestions(shuffled(items));
          setAnswers({});
          setFinished(false);
          setAttemptId(attempt.id ?? null);
          setLoading(false);
        }
      } catch {
        if (active) {
          setQuestions([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [type]);

  const score = questions.filter(
    (question) =>
      answers[question.id] ===
      question.choices.find((choice) => choice.is_correct)?.id,
  ).length;
  const wrongQuestions = questions.filter(
    (question) =>
      answers[question.id] !==
      question.choices.find((choice) => choice.is_correct)?.id,
  );
  const scramble = () => {
    setQuestions((current) => shuffled(current));
    setAnswers({});
    setFinished(false);
  };
  const redoMistakes = () => {
    if (!wrongQuestions.length) return;
    setQuestions(shuffled(wrongQuestions));
    setAnswers({});
    setFinished(false);
  };

  const submit = async () => {
    if (!questions.length || !attemptId || submitting) return;
    const unanswered = questions
      .map((question, index) => (answers[question.id] ? null : index + 1))
      .filter((index): index is number => index !== null);
    if (unanswered.length) {
      window.alert(
        `Please answer question${unanswered.length === 1 ? "" : "s"}: ${unanswered.join(", ")}.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await Promise.all(
        questions.map((question) =>
          fetch(`/api/exam-attempts/${attemptId}/answers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question_id: question.id,
              selected_choice_id: answers[question.id],
            }),
          }),
        ),
      );

      await fetch(`/api/exam-attempts/${attemptId}/complete`, {
        method: "POST",
      });

      setFinished(true);
    } catch (err) {
      console.error("Failed to submit practice exam:", err);
      window.alert(
        "Something went wrong submitting your exam. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (locked) {
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
        <Card>
          <h1 className="text-xl font-bold">Not quite ready yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Finish 100% of the flashcards and memorization set for{" "}
            {examLabels[type]} before taking the practice exam.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-semibold"
          >
            Back
          </button>
        </Card>
      </main>
    );
  }

  if (loading)
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
        <Card>
          <p className="text-sm text-muted-foreground">
            Loading practice questions...
          </p>
        </Card>
      </main>
    );
  if (finished)
    return (
      <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
        <Result
          correct={score}
          wrong={wrongQuestions.length}
          onTryAgain={scramble}
          onRedoMistakes={redoMistakes}
        />
        <Card>
          <p className="font-mono text-xs uppercase text-primary">
            {examLabels[type]} - Results
          </p>
          <h1 className="mt-3 text-display-sm font-bold">
            {score} / {questions.length} correct
          </h1>
        </Card>
        {questions.map((question, index) => (
          <Card key={`${question.id}-${index}`}>
            <h2 className="font-semibold">{question.text}</h2>
            <p className="mt-3 text-sm text-emerald-400">
              <strong>Correct answer:</strong>{" "}
              {question.choices.find((choice) => choice.is_correct)?.text}
            </p>
          </Card>
        ))}
      </main>
    );

  return (
    <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="-ml-1 min-h-11 px-1 text-sm text-muted-foreground"
        >
          Back
        </button>
        <button
          onClick={scramble}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
        >
          <Shuffle className="size-3.5" /> Scramble
        </button>
      </div>
      <h1 className="text-display-sm font-bold">{examLabels[type]} Practice Exam</h1>
      {questions.map((question, index) => (
        <Card key={`${question.id}-${index}`}>
          <p className="font-mono text-xs text-primary">Question {index + 1}</p>
          <h2 className="mt-3 font-semibold leading-7">{question.text}</h2>
          <div className="mt-4 flex flex-col gap-3">
            {question.choices.map((choice, choiceIndex) => (
              <button
                key={choice.id}
                onClick={() =>
                  setAnswers((current) => ({
                    ...current,
                    [question.id]: choice.id,
                  }))
                }
                className={`flex min-h-12 w-full items-start gap-3 rounded-2xl border p-4 text-left ${answers[question.id] === choice.id ? "border-primary bg-primary/10" : "border-border"}`}
              >
                <span className="shrink-0 pt-0.5 font-mono text-xs">
                  {String.fromCharCode(65 + choiceIndex)}
                </span>
                <span className="min-w-0 flex-1">{choice.text}</span>
              </button>
            ))}
          </div>
        </Card>
      ))}
      <button
        onClick={submit}
        disabled={submitting}
        className="bottom-safe sticky min-h-12 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground shadow-lg disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Done - Finish Exam"}
      </button>
    </main>
  );
}

export function PracticeExamPage() {
  return (
    <Suspense fallback={<PracticeExamLoading />}>
      <PracticeExamContent />
    </Suspense>
  );
}

function PracticeExamLoading() {
  return (
    <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 pt-8 sm:gap-5">
      <Card>
        <p className="text-sm text-muted-foreground">
          Loading practice questions...
        </p>
      </Card>
    </main>
  );
}
