// app/(wherever this route is)/reviewer-app.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FileText,
  RotateCcw,
  Target,
} from "lucide-react";
import { examLabels, examTypes } from "@/lib/types/common";
import type { ExamType } from "@/lib/types/common";
import { modeLabels, studyModes } from "@/lib/types/study";
import type { StudyMode } from "@/lib/types/study";
import { Header } from "@/components/ui/header";
import { Options } from "@/components/ui/options";
import { Progress, ProgressBar } from "@/components/ui/progress";
import type { ProgressState } from "@/components/ui/progress";
import { Library } from "@/app/resources/library";

const initialProgress: ProgressState = {
  VUL: { flashcard: 0, memorize: 0, practice: 0 },
  TRADITIONAL_LIFE: { flashcard: 0, memorize: 0, practice: 0 },
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      {children}
    </section>
  );
}

function Dashboard({
  select,
  progress,
  library,
}: {
  select: (mode: StudyMode) => void;
  progress: typeof initialProgress;
  library: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-10">
      <div className="pt-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Insurance licensing
        </p>
        <h1 className="mt-2 text-3xl font-bold">Your Reviewer</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose a study mode and keep moving toward exam day.
        </p>
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Reviewer</h2>
          <Target className="size-5 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {examTypes.map((type, i) => {
            const overall = Math.round(
              Object.values(progress[type]).reduce((a, b) => a + b, 0) / 3,
            );
            return (
              <div key={type} className="rounded-2xl bg-muted p-4">
                <p className="font-mono text-xs uppercase text-muted-foreground">
                  {examLabels[type]}
                </p>
                <p className="mt-2 text-2xl font-bold">{overall}%</p>
                <ProgressBar value={overall} blue={i === 1} />
              </div>
            );
          })}
        </div>
      </Card>
      <button
        onClick={library}
        className="flex items-center justify-between rounded-2xl border border-primary/50 bg-primary/10 p-4 text-left hover:bg-primary/15"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </span>
          <span>
            <span className="block font-bold">Manage reviewer content</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Add terms and manuals
            </span>
          </span>
        </span>
        <ArrowRight className="size-4 text-primary" />
      </button>
      <Card>
        <h2 className="mb-4 font-bold">Study modes</h2>
        <div className="flex flex-col gap-3">
          {studyModes.map((mode) => (
            <button
              key={mode}
              onClick={() => select(mode)}
              className="flex items-center justify-between rounded-2xl border border-border px-4 py-4 text-left font-semibold hover:border-primary"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  {mode === "flashcard" ? (
                    <BookOpen className="size-4" />
                  ) : mode === "memorize" ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <Target className="size-4" />
                  )}
                </span>
                {modeLabels[mode]}
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Card>
    </main>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"dashboard" | "progress" | "library">(
    "dashboard",
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [progress, setProgress] = useState(initialProgress);
  useEffect(() => {
    const saved = window.localStorage.getItem("reviewer-progress");
    if (saved) setProgress(JSON.parse(saved));
    const savedTheme = window.localStorage.getItem("reviewer-theme") as
      | "dark"
      | "light"
      | null;
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem("reviewer-theme", theme);
  }, [theme]);
  const home = () => {
    setMode(null);
    setScreen("dashboard");
  };
  const select = (m: StudyMode) => {
    setMode(m);
    setScreen("dashboard");
  };
  const choose = (t: ExamType) => {
    const route =
      mode === "practice"
        ? "practiceExam"
        : mode === "memorize"
          ? "memorization"
          : "flashCard";
    router.push(`/learningMethods/${route}?exam_type=${encodeURIComponent(t)}`);
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        home={home}
        theme={theme}
        toggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
        progress={() => {
          setMode(null);
          setScreen("progress");
        }}
      />
      {screen === "dashboard" && !mode && (
        <Dashboard
          select={select}
          progress={progress}
          library={() => setScreen("library")}
        />
      )}
      {screen === "dashboard" && mode && (
        <Options mode={mode} choose={choose} back={home} />
      )}
      {screen === "progress" && <Progress back={home} data={progress} />}
      {screen === "library" && <Library back={home} />}
    </div>
  );
}
