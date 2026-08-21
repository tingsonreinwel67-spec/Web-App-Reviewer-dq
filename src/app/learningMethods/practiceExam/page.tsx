"use client";

import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { examLabels, type ExamType } from "@/lib/types/common";
import type { Question } from "@/lib/types/questions";
import { Result } from "@/components/ui/result";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">{children}</section>;
}

export default function PracticeExamPage() {
  const searchParams = useSearchParams();
  const type: ExamType = searchParams.get("exam_type") === "TRADITIONAL_LIFE" ? "TRADITIONAL_LIFE" : "VUL";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<Question["id"], string>>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/questions?exam_type=${encodeURIComponent(type)}`)
      .then((response) => response.json() as Promise<Question[]>)
      .then((items) => { if (active) { setQuestions(shuffled(items)); setAnswers({}); setFinished(false); } })
      .catch(() => active && setQuestions([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [type]);

  const score = questions.filter((question) => answers[question.id] === question.choices.find((choice) => choice.is_correct)?.id).length;
  const scramble = () => { setQuestions((current) => shuffled(current)); setAnswers({}); setFinished(false); };
  const submit = () => {
    if (!questions.length || !questions.every((question) => answers[question.id])) return;
    const saved = window.localStorage.getItem("reviewer-progress");
    const progress = saved ? JSON.parse(saved) : { VUL: { flashcard: 0, memorize: 0, practice: 0 }, TRADITIONAL_LIFE: { flashcard: 0, memorize: 0, practice: 0 } };
    progress[type].practice = Math.max(progress[type].practice, Math.round((score / questions.length) * 100));
    window.localStorage.setItem("reviewer-progress", JSON.stringify(progress));
    setFinished(true);
  };

  if (loading) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10"><Card><p className="text-sm text-muted-foreground">Loading practice questions...</p></Card></main>;
  if (finished) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10"><Result /><Card><p className="font-mono text-xs uppercase text-primary">{examLabels[type]} - Results</p><h1 className="mt-3 text-3xl font-bold">{score} / {questions.length} correct</h1></Card>{questions.map((question, index) => <Card key={`${question.id}-${index}`}><h2 className="font-semibold">{question.text}</h2><p className="mt-3 text-sm text-emerald-400"><strong>Correct answer:</strong> {question.choices.find((choice) => choice.is_correct)?.text}</p></Card>)}<button onClick={scramble} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Scramble and try again</button></main>;

  return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10"><div className="flex items-center justify-between"><button onClick={() => window.history.back()} className="text-sm text-muted-foreground">Back</button><button onClick={scramble} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"><Shuffle className="size-3.5" /> Scramble</button></div><h1 className="text-3xl font-bold">{examLabels[type]} Practice Exam</h1>{questions.map((question, index) => <Card key={`${question.id}-${index}`}><p className="font-mono text-xs text-primary">Question {index + 1}</p><h2 className="mt-3 font-semibold leading-7">{question.text}</h2><div className="mt-4 flex flex-col gap-3">{question.choices.map((choice, choiceIndex) => <button key={choice.id} onClick={() => setAnswers((current) => ({ ...current, [question.id]: choice.id }))} className={`rounded-2xl border p-4 text-left ${answers[question.id] === choice.id ? "border-primary bg-primary/10" : "border-border"}`}><span className="mr-3 font-mono text-xs">{String.fromCharCode(65 + choiceIndex)}</span>{choice.text}</button>)}</div></Card>)}<button onClick={submit} className="sticky bottom-4 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Done - Finish Exam</button></main>;
}
