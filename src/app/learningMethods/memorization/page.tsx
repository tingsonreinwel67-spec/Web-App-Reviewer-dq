"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Shuffle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { examLabels, type ExamType } from "@/lib/types/common";
import type { Question } from "@/lib/types/questions";
import { Result } from "@/components/ui/result";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">{children}</section>;
}

export default function MemorizationPage() {
  const searchParams = useSearchParams();
  const type: ExamType = searchParams.get("exam_type") === "TRADITIONAL_LIFE" ? "TRADITIONAL_LIFE" : "VUL";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/questions?exam_type=${encodeURIComponent(type)}`)
      .then((response) => response.json() as Promise<Question[]>)
      .then((items) => { if (active) { setQuestions(shuffled(items)); setIndex(0); setSelected(null); setChecked(false); setWrong([]); setFinished(false); } })
      .catch(() => active && setQuestions([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [type]);

  const question = questions[index];
  const correct = question?.choices.find((choice) => choice.is_correct)?.id;
  const scramble = () => { setQuestions((current) => shuffled(current)); setIndex(0); setSelected(null); setChecked(false); setWrong([]); setFinished(false); };
  const check = () => {
    if (!selected || !question || !correct) return;
    setChecked(true);
    if (selected !== correct && !wrong.some((item) => item.id === question.id)) setWrong((items) => [...items, question]);
    else if (selected === correct) setWrong((items) => items.filter((item) => item.id !== question.id));
  };
  const complete = () => {
    const saved = window.localStorage.getItem("reviewer-progress");
    const progress = saved ? JSON.parse(saved) : { VUL: { flashcard: 0, memorize: 0, practice: 0 }, TRADITIONAL_LIFE: { flashcard: 0, memorize: 0, practice: 0 } };
    progress[type].memorize = Math.max(progress[type].memorize, 100 - Math.round((wrong.length / questions.length) * 100));
    window.localStorage.setItem("reviewer-progress", JSON.stringify(progress));
    setFinished(true);
  };

  if (loading) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10"><Card><p className="text-sm text-muted-foreground">Loading questions...</p></Card></main>;
  if (finished) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10"><Result /><button onClick={scramble} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Try again</button></main>;
  if (!question) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10"><Card><p className="text-sm text-muted-foreground">No questions are available for this exam right now.</p></Card></main>;

  return <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-10"><div className="flex items-center justify-between"><button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="size-4" /> Back</button><button onClick={scramble} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"><Shuffle className="size-3.5" /> Scramble</button></div><div className="flex justify-between"><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{examLabels[type]} - Memorization</p><span className="text-xs text-muted-foreground">{index + 1} / {questions.length}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><Card><p className="font-mono text-xs uppercase text-primary">{question.category}</p><h1 className="mt-6 text-xl font-semibold leading-8">{question.text}</h1><div className="mt-6 flex flex-col gap-3">{question.choices.map((choice, choiceIndex) => <button key={choice.id} type="button" onClick={() => setSelected(choice.id)} className={`rounded-2xl border p-4 text-left ${selected === choice.id ? "border-primary bg-primary/10" : "border-border"}`}><span className="mr-3 font-mono text-xs">{String.fromCharCode(65 + choiceIndex)}</span>{choice.text}</button>)}{checked && <p className={`text-sm font-semibold ${selected === correct ? "text-emerald-400" : "text-rose-400"}`}>{selected === correct ? "Correct" : "Incorrect - keep this question in your retry queue."}</p>}</div></Card><button onClick={check} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Check answer</button><button onClick={() => { if (!checked) return; if (index === questions.length - 1) complete(); else { setIndex(index + 1); setSelected(null); setChecked(false); } }} className="rounded-xl border border-border px-5 py-3 font-bold">{index === questions.length - 1 ? "Complete" : "Next question"}</button></main>;
}
