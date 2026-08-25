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

export default function FlashCardPage() {
  const searchParams = useSearchParams();
  const type: ExamType = searchParams.get("exam_type") === "TRADITIONAL_LIFE" ? "TRADITIONAL_LIFE" : "VUL";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [wrong, setWrong] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/questions?exam_type=${encodeURIComponent(type)}`)
      .then((response) => response.json() as Promise<Question[]>)
      .then((items) => { if (active) { setQuestions(shuffled(items)); setIndex(0); setRevealed(false); setWrong([]); setFinished(false); } })
      .catch(() => active && setQuestions([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [type]);

  const question = questions[index];
  const scramble = () => { setQuestions((current) => shuffled(current)); setRevealed(false); };
  const restart = () => { setQuestions((current) => shuffled(current)); setIndex(0); setRevealed(false); setWrong([]); setFinished(false); };
  const redoMistakes = () => {
    if (!wrong.length) return;
    setQuestions(shuffled(wrong)); setIndex(0); setRevealed(false); setWrong([]); setFinished(false);
  };
  const complete = () => {
    const saved = window.localStorage.getItem("reviewer-progress");
    const progress = saved ? JSON.parse(saved) : { VUL: { flashcard: 0, memorize: 0, practice: 0 }, TRADITIONAL_LIFE: { flashcard: 0, memorize: 0, practice: 0 } };
    progress[type].flashcard = Math.max(progress[type].flashcard, 100);
    window.localStorage.setItem("reviewer-progress", JSON.stringify(progress));
    setFinished(true);
  };
  const answer = (isCorrect: boolean) => {
    if (!question) return;
    const updatedWrong = isCorrect ? wrong : [...wrong, question];
    setWrong(updatedWrong);
    if (index === questions.length - 1) complete();
    else { setIndex(index + 1); setRevealed(false); }
  };

  if (loading) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10"><Card><p className="text-sm text-muted-foreground">Loading questions...</p></Card></main>;
  if (finished) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10"><Result correct={questions.length - wrong.length} wrong={wrong.length} onTryAgain={restart} onRedoMistakes={redoMistakes} /></main>;
  if (!question) return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10"><Card><p className="text-sm text-muted-foreground">No questions are available for this exam right now.</p></Card></main>;

  return <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-10"><div className="flex items-center justify-between"><button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="size-4" /> Back</button><button onClick={scramble} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"><Shuffle className="size-3.5" /> Scramble</button></div><div className="flex justify-between"><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{examLabels[type]} - Flashcard</p><span className="text-xs text-muted-foreground">{index + 1} / {questions.length}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><button type="button" onClick={() => setRevealed(!revealed)} className="text-left"><Card><p className="font-mono text-xs uppercase text-primary">{question.category}</p><h1 className="mt-6 text-xl font-semibold leading-8">{question.text}</h1><div className="mt-8 rounded-2xl bg-muted p-4 text-sm leading-6">{revealed ? <><strong>Answer:</strong> {question.choices.find((choice) => choice.is_correct)?.text}<p className="mt-2 text-muted-foreground">{question.explanation}</p></> : <span className="text-muted-foreground">Tap to reveal the answer.</span>}</div></Card></button>{revealed && <div className="grid grid-cols-2 gap-3"><button onClick={() => answer(false)} className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-5 py-3 font-bold text-rose-600 dark:text-rose-300">Review again</button><button onClick={() => answer(true)} className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-5 py-3 font-bold text-emerald-600 dark:text-emerald-300">Got it</button></div>}</main>;
}
