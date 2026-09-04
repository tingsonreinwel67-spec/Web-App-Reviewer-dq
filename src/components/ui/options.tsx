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
    <main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
      <button onClick={back} className="-ml-1 flex min-h-11 items-center gap-1 self-start px-1 text-sm text-muted-foreground">
        <ChevronLeft className="size-4" /> Back
      </button>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{modeLabels[mode]}</p>
        <h1 className="mt-2 text-display-sm font-bold">What are you studying?</h1>
      </div>
      {examTypes.map((type) => (
        <button key={type} onClick={() => choose(type)} className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary sm:rounded-3xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold sm:text-2xl">{examLabels[type]}</h2>
            <ArrowRight className="shrink-0 text-muted-foreground" />
          </div>
        </button>
      ))}
    </main>
  );
}