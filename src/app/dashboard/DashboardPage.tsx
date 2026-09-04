"use client";

import { AppNav } from "@/components/ui/app-nav";
import type { Eligibility } from "@/lib/eligibility";
import { lockReason } from "@/lib/eligibility";
import { examTypes, type ExamType } from "@/lib/types/common";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Layers,
  Lock,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type ProgressSummaryRow = {
  exam_type: ExamType;
  flashcard_pct: number;
  memorize_pct: number;
  practice_exam_pct: number;
  overall_pct: number;
};

const trackCopy: Record<ExamType, { title: string; blurb: string }> = {
  VUL: {
    title: "VUL (Variable Universal Life)",
    blurb: "Master the complexities of investment-linked insurance.",
  },
  TRADITIONAL_LIFE: {
    title: "Traditional Life",
    blurb: "Core fundamentals of whole and term life insurance.",
  },
};

const emptyProgress: Record<ExamType, number> = {
  VUL: 0,
  TRADITIONAL_LIFE: 0,
};

function TrackCard({
  type,
  overall,
  eligibility,
  active,
}: {
  type: ExamType;
  overall: number;
  eligibility: Eligibility | null;
  active: boolean;
}) {
  const { title, blurb } = trackCopy[type];
  const started = overall > 0;
  const locked = eligibility ? !eligibility.eligible : true;
  const reason = eligibility
    ? lockReason(eligibility.flashcards, eligibility.memorization)
    : "Checking your progress…";

  return (
    <section className="rv-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {active && (
            <span className="rounded bg-[#FFD400] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#0B2340]">
              Active
            </span>
          )}
          <h3 className="text-lg font-extrabold">{title}</h3>
        </div>
        {active ? (
          <LineChart className="size-5 shrink-0 text-[#C98A00]" />
        ) : (
          <ShieldCheck className="size-5 shrink-0 text-[#0B2340]" />
        )}
      </div>

      <p className="mt-1.5 text-sm text-muted-foreground">{blurb}</p>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-xs font-bold">
          <span>Overall Progress</span>
          <span>{overall}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${
              active ? "bg-[#8A6D0B]" : "bg-[#0B2340]"
            }`}
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={`/learningMethods/flashCard?exam_type=${type}`}
          className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
            active
              ? "bg-[#FFD400] text-[#0B2340] hover:bg-[#E8C200]"
              : "border border-border bg-muted text-foreground hover:bg-[#e9e2d2]"
          }`}
        >
          {started ? "Resume Study" : "Start Track"}
        </Link>

        {locked ? (
          <span
            aria-disabled="true"
            title={reason ?? undefined}
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-bold text-muted-foreground"
          >
            <Lock className="size-3.5" />
            Practice Exam
          </span>
        ) : (
          <Link
            href={`/learningMethods/practiceExam?exam_type=${type}`}
            className="rounded-lg border-2 border-[#FFD400] px-4 py-2.5 text-sm font-bold text-[#0B2340] transition hover:bg-[#FFF8D6]"
          >
            Practice Exam
          </Link>
        )}
      </div>

      {locked && reason && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Lock className="mt-0.5 size-3 shrink-0" />
          {reason}
        </p>
      )}
    </section>
  );
}

function QuickAccess({ dueToday }: { dueToday: number }) {
  return (
    <aside>
      <h2 className="text-2xl font-extrabold">Quick Access</h2>

      <Link
        href="/learningMethods/flashCard"
        className="mt-5 block rounded-xl bg-[#0B2340] p-5 text-white transition hover:bg-[#0F2E4D]"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="size-5 text-[#FFD400]" />
          <h3 className="text-lg font-extrabold">Flashcards</h3>
        </div>
        <p className="mt-2 text-sm text-white/75">
          Quick recall and spaced repetition for key concepts.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-bold text-[#FFD400]">
            {dueToday} due today
          </span>
          <ArrowRight className="size-4 text-[#FFD400]" />
        </div>
      </Link>

      {[
        {
          href: "/learningMethods/memorization",
          icon: BrainCircuit,
          title: "Memorize",
          blurb: "Deep learning pathways for complex formulas.",
          action: "Continue Session",
        },
        {
          href: "/glossary",
          icon: BookOpen,
          title: "Glossary",
          blurb: "Comprehensive index of industry terms.",
          action: "Browse A-Z",
        },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rv-card mt-4 block p-5 transition hover:border-[#C9A227]"
        >
          <div className="flex items-center gap-2.5">
            <item.icon className="size-5 text-[#527087]" />
            <h3 className="text-lg font-extrabold">{item.title}</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.blurb}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#0B2340]">
              {item.action}
            </span>
            <ArrowRight className="size-4 text-[#0B2340]" />
          </div>
        </Link>
      ))}
    </aside>
  );
}

export function DashboardPage() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState(emptyProgress);
  const [eligibility, setEligibility] = useState<
    Partial<Record<ExamType, Eligibility>>
  >({});

  useEffect(() => {
    let active = true;

    fetch("/api/progress")
      .then((response) => response.json())
      .then((rows: ProgressSummaryRow[]) => {
        if (!active || !Array.isArray(rows)) return;
        const next = { ...emptyProgress };
        for (const row of rows) next[row.exam_type] = row.overall_pct;
        setProgress(next);
      })
      .catch((error) => console.error("Failed to load progress:", error));

    Promise.all(
      examTypes.map((type) =>
        fetch(`/api/attempts/eligibility?exam_type=${type}`)
          .then((response) => response.json())
          .then((data: Eligibility) => [type, data] as const),
      ),
    )
      .then((entries) => {
        if (active) setEligibility(Object.fromEntries(entries));
      })
      .catch((error) => console.error("Failed to load eligibility:", error));

    return () => {
      active = false;
    };
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] ?? "Scholar";

  // Cards left to master across both tracks — the real "due today" number.
  const dueToday = examTypes.reduce((total, type) => {
    const counts = eligibility[type]?.flashcards;
    return counts ? total + (counts.total - counts.mastered) : total;
  }, 0);

  const activeTrack = examTypes.reduce((best, type) =>
    progress[type] > progress[best] ? type : best,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="rv-shell py-10">
        <h1 className="text-4xl font-extrabold md:text-5xl">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your certification journey is looking bright today.
        </p>

        <div className="mt-9 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-2xl font-extrabold">Exam Tracks</h2>
            <div className="mt-5 flex flex-col gap-4">
              {examTypes.map((type) => (
                <TrackCard
                  key={type}
                  type={type}
                  overall={progress[type]}
                  eligibility={eligibility[type] ?? null}
                  active={type === activeTrack && progress[type] > 0}
                />
              ))}
            </div>
          </div>

          <QuickAccess dueToday={dueToday} />
        </div>
      </main>
    </div>
  );
}
