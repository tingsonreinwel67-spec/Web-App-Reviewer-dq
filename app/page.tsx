"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  Home,
  RotateCcw,
  Shuffle,
  Target,
  X,
} from "lucide-react";
import {
  examLabels,
  modeLabels,
  type ExamType,
  type Question,
  type StudyMode,
} from "@/lib/exams/types";
import { traditionalContent } from "@/lib/exams/traditional";
import { vulContent } from "@/lib/exams/vul";

type Screen = "dashboard" | "progress" | "flashcard" | "memorize" | "practice";
type ProgressState = Record<
  ExamType,
  Record<"flashcard" | "memorize" | "practice", number>
>;
const initialProgress: ProgressState = {
  vul: { flashcard: 0, memorize: 0, practice: 0 },
  traditional: { flashcard: 0, memorize: 0, practice: 0 },
};
const content = (type: ExamType) =>
  type === "vul" ? vulContent : traditionalContent;
const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
function ProgressBar({
  value,
  blue = false,
}: {
  value: number;
  blue?: boolean;
}) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${blue ? "bg-primary" : "bg-emerald-500"}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      {children}
    </section>
  );
}
function Header({
  home,
  progress,
}: {
  home: () => void;
  progress: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-5 py-5">
      <button
        onClick={home}
        className="flex items-center gap-2 font-mono text-sm font-bold"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="size-4" />
        </span>{" "}
        REVIEWER
      </button>
      <button
        onClick={progress}
        className="rounded-full p-2 text-muted-foreground hover:bg-muted"
        aria-label="View progress"
      >
        <BarChart3 className="size-5" />
      </button>
    </header>
  );
}
function Dashboard({
  select,
  progress,
}: {
  select: (mode: StudyMode) => void;
  progress: ProgressState;
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
          {(["vul", "traditional"] as ExamType[]).map((type, i) => {
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
      <Card>
        <h2 className="mb-4 font-bold">Study modes</h2>
        <div className="flex flex-col gap-3">
          {(["flashcard", "memorize", "practice"] as StudyMode[]).map(
            (mode) => (
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
            ),
          )}
        </div>
      </Card>
    </main>
  );
}
function Picker({
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
      <button
        onClick={back}
        className="flex items-center gap-1 self-start text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> Back
      </button>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {modeLabels[mode]}
        </p>
        <h1 className="mt-2 text-3xl font-bold">What are you studying?</h1>
      </div>
      {(["vul", "traditional"] as ExamType[]).map((type) => (
        <button
          key={type}
          onClick={() => choose(type)}
          className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{examLabels[type]}</h2>
            <ArrowRight className="text-muted-foreground" />
          </div>
        </button>
      ))}
    </main>
  );
}
function Study({
  mode,
  type,
  back,
  update,
}: {
  mode: "flashcard" | "memorize";
  type: ExamType;
  back: () => void;
  update: (mode: "flashcard" | "memorize", value: number) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>(
    () => content(type).questions,
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState<Question[]>([]);
  const question = questions[index];
  const correct = question.answers.find((a) => a.correct)?.id;
  const scramble = () => {
    setQuestions(shuffled(content(type).questions));
    setIndex(0);
    setRevealed(false);
    setSelected(null);
    setChecked(false);
    setWrong([]);
  };
  const next = () => {
    if (mode === "flashcard" && !revealed) return;
    if (mode === "memorize" && !checked) return;
    if (index === questions.length - 1) {
      update(
        mode,
        mode === "flashcard"
          ? 100
          : 100 - Math.round((wrong.length / questions.length) * 100),
      );
      setIndex(0);
      setRevealed(false);
      setSelected(null);
      setChecked(false);
      setWrong([]);
      return;
    }
    setIndex(index + 1);
    setRevealed(false);
    setSelected(null);
    setChecked(false);
  };
  const check = () => {
    if (!selected) return;
    setChecked(true);
    if (selected !== correct && !wrong.some((q) => q.id === question.id))
      setWrong((items) => [...items, question]);
    else if (selected === correct)
      setWrong((items) => items.filter((q) => q.id !== question.id));
  };
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-10">
      <div className="flex items-center justify-between">
        <button
          onClick={back}
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
          {examLabels[type]} · {modeLabels[mode]}
        </p>
        <span className="text-xs text-muted-foreground">
          {index + 1} / {questions.length}
        </span>
      </div>
      <ProgressBar value={((index + 1) / questions.length) * 100} />
      <button
        type="button"
        onClick={() => mode === "flashcard" && setRevealed(!revealed)}
        className="text-left"
      >
        <Card>
          <p className="font-mono text-xs uppercase text-primary">
            {question.section}
          </p>
          <h1 className="mt-6 text-xl font-semibold leading-8">
            {question.prompt}
          </h1>
          {mode === "flashcard" && (
            <div className="mt-8 rounded-2xl bg-muted p-4 text-sm leading-6">
              {revealed ? (
                <>
                  <strong>Answer:</strong>{" "}
                  {question.answers.find((a) => a.correct)?.text}
                  <p className="mt-2 text-muted-foreground">
                    {question.explanation}
                  </p>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Tap to reveal the answer.
                </span>
              )}
            </div>
          )}
          {mode === "memorize" && (
            <div className="mt-6 flex flex-col gap-3">
              {question.answers.map((answer, i) => (
                <button
                  key={answer.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(answer.id);
                  }}
                  className={`rounded-2xl border p-4 text-left ${selected === answer.id ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <span className="mr-3 font-mono text-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {answer.text}
                </button>
              ))}
              {checked && (
                <p
                  className={`text-sm font-semibold ${selected === correct ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {selected === correct
                    ? "Correct"
                    : "Incorrect — keep this question in your retry queue."}
                </p>
              )}
            </div>
          )}
        </Card>
      </button>
      {mode === "memorize" && (
        <button
          onClick={check}
          className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
        >
          Check answer
        </button>
      )}
      <button
        onClick={next}
        className="rounded-xl border border-border px-5 py-3 font-bold"
      >
        {index === questions.length - 1
          ? "Complete and restart"
          : "Next question"}
      </button>
    </main>
  );
}
function Practice({
  type,
  back,
  update,
}: {
  type: ExamType;
  back: () => void;
  update: (mode: "practice", value: number) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>(
    () => content(type).questions,
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const score = questions.filter(
    (q) => answers[q.id] === q.answers.find((a) => a.correct)?.id,
  ).length;
  const scramble = () => {
    setQuestions(shuffled(content(type).questions));
    setAnswers({});
    setFinished(false);
  };
  const submit = () => {
    if (questions.every((q) => answers[q.id])) {
      update("practice", Math.round((score / questions.length) * 100));
      setFinished(true);
    }
  };
  if (finished)
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10">
        <Card>
          <p className="font-mono text-xs uppercase text-primary">
            {examLabels[type]} · Results
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            {score} / {questions.length} correct
          </h1>
        </Card>
        {questions.map((q, i) => (
          <Card key={`${q.id}-${i}`}>
            <h2 className="font-semibold">{q.prompt}</h2>
            <p className="mt-3 text-sm text-emerald-400">
              <strong>Correct answer:</strong>{" "}
              {q.answers.find((a) => a.correct)?.text}
            </p>
          </Card>
        ))}
        <button
          onClick={scramble}
          className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
        >
          Scramble and try again
        </button>
      </main>
    );
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={back} className="text-sm text-muted-foreground">
          Back
        </button>
        <button
          onClick={scramble}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
        >
          <Shuffle className="size-3.5" /> Scramble
        </button>
      </div>
      <h1 className="text-3xl font-bold">{examLabels[type]} Practice Exam</h1>
      {questions.map((q, i) => (
        <Card key={`${q.id}-${i}`}>
          <p className="font-mono text-xs text-primary">Question {i + 1}</p>
          <h2 className="mt-3 font-semibold leading-7">{q.prompt}</h2>
          <div className="mt-4 flex flex-col gap-3">
            {q.answers.map((a, j) => (
              <button
                key={a.id}
                onClick={() => setAnswers((v) => ({ ...v, [q.id]: a.id }))}
                className={`rounded-2xl border p-4 text-left ${answers[q.id] === a.id ? "border-primary bg-primary/10" : "border-border"}`}
              >
                <span className="mr-3 font-mono text-xs">
                  {String.fromCharCode(65 + j)}
                </span>
                {a.text}
              </button>
            ))}
          </div>
        </Card>
      ))}
      <button
        onClick={submit}
        className="sticky bottom-4 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
      >
        Done — Finish Exam
      </button>
    </main>
  );
}
function Progress({ back, data }: { back: () => void; data: ProgressState }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10">
      <button
        onClick={back}
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> Back
      </button>
      <h1 className="text-3xl font-bold">My Progress</h1>
      {(["vul", "traditional"] as ExamType[]).map((type) => (
        <Card key={type}>
          <h2 className="text-xl font-bold">{examLabels[type]}</h2>
          <div className="mt-5 flex flex-col gap-4">
            {(["flashcard", "memorize", "practice"] as const).map((mode) => (
              <div key={mode}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{modeLabels[mode]}</span>
                  <strong>{data[type][mode]}%</strong>
                </div>
                <ProgressBar
                  value={data[type][mode]}
                  blue={type === "traditional"}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </main>
  );
}
export default function Page() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [type, setType] = useState<ExamType | null>(null);
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  useEffect(() => {
    const saved = window.localStorage.getItem("reviewer-progress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);
  const update = (
    exam: ExamType,
    mode: "flashcard" | "memorize" | "practice",
    value: number,
  ) =>
    setProgress((p) => {
      const next = {
        ...p,
        [exam]: { ...p[exam], [mode]: Math.max(p[exam][mode], value) },
      };
      window.localStorage.setItem("reviewer-progress", JSON.stringify(next));
      return next;
    });
  const home = () => {
    setMode(null);
    setType(null);
    setScreen("dashboard");
  };
  const select = (m: StudyMode) => {
    setMode(m);
    setType(null);
    setScreen("dashboard");
  };
  const choose = (t: ExamType) => {
    setType(t);
    setScreen(
      mode === "practice"
        ? "practice"
        : mode === "memorize"
          ? "memorize"
          : "flashcard",
    );
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        home={home}
        progress={() => {
          setMode(null);
          setType(null);
          setScreen("progress");
        }}
      />
      {screen === "dashboard" && !mode && (
        <Dashboard select={select} progress={progress} />
      )}
      {screen === "dashboard" && mode && !type && (
        <Picker mode={mode} choose={choose} back={home} />
      )}
      {type && screen === "flashcard" && (
        <Study
          mode="flashcard"
          type={type}
          back={home}
          update={(m, v) => update(type, m, v)}
        />
      )}
      {type && screen === "memorize" && (
        <Study
          mode="memorize"
          type={type}
          back={home}
          update={(m, v) => update(type, m, v)}
        />
      )}
      {type && screen === "practice" && (
        <Practice
          type={type}
          back={home}
          update={(m, v) => update(type, m, v)}
        />
      )}
      {screen === "progress" && <Progress back={home} data={progress} />}
      <footer className="mx-auto flex max-w-2xl justify-center px-5 pb-8">
        <button
          onClick={home}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Home className="size-3.5" /> Reviewer home
        </button>
      </footer>
    </div>
  );
}
