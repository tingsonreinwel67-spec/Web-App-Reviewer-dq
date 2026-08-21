"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import { examLabels, examTypes, type ExamType } from "@/lib/types/common";
import { modeLabels, type StudyMode } from "@/lib/types/study";

export function Options({
  mode,
  choose,
  back,
}: {
  mode: StudyMode;
  choose: (type: ExamType) => void;
  back: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-10">
      <button onClick={back} className="flex items-center gap-1 self-start text-sm text-muted-foreground">
        <ChevronLeft className="size-4" /> Back
      </button>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{modeLabels[mode]}</p>
        <h1 className="mt-2 text-3xl font-bold">What are you studying?</h1>
      </div>
      {examTypes.map((type) => (
        <button key={type} onClick={() => choose(type)} className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm hover:border-primary">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{examLabels[type]}</h2>
            <ArrowRight className="text-muted-foreground" />
          </div>
        </button>
      ))}
    </main>
  );
}