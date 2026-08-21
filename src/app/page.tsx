"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileText,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  RotateCcw,
  Shuffle,
  Target,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  examLabels,
  examTypes,
} from "@/lib/types/common";
import type { ExamType } from "@/lib/types/common";
import type { Question } from "@/lib/types/questions";
import { modeLabels, studyModes } from "@/lib/types/study";
import type { StudyMode } from "@/lib/types/study";

type ProgressState = Record<ExamType, Record<StudyMode, number>>;

const initialProgress: ProgressState = {
  VUL: { flashcard: 0, memorize: 0, practice: 0 },
  TRADITIONAL_LIFE: { flashcard: 0, memorize: 0, practice: 0 },
};

const fetchExamQuestions = async (type: ExamType): Promise<Question[]> => {
  const response = await fetch(
    `/api/questions?exam_type=${encodeURIComponent(type)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load ${type} questions`);
  }

  return (await response.json()) as Question[];
};

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
  theme,
  toggleTheme,
}: {
  home: () => void;
  progress: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4">
      <button onClick={home} className="flex items-center gap-2 font-mono text-sm font-bold">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="size-4" />
        </span>
        REVIEWER
      </button>
      <div className="flex items-center gap-1">
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 hover:bg-muted" aria-expanded={profileOpen} aria-label="Open user menu">
            <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><User className="size-4" /></span>
            <span className="hidden text-left text-xs font-semibold sm:block">Reinwel_Tingson</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-xl">
              <div className="border-b border-border px-3 py-3">
                <p className="font-semibold">Reinwel_Tingson</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">tingsonreinwel67@gmail.com</p>
              </div>
              <button onClick={() => { setProfileOpen(false); progress(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted">
                <BarChart3 className="size-4 text-primary" /> Progress
              </button>
              <button onClick={() => { toggleTheme(); setProfileOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted">
                {theme === "dark" ? <Sun className="size-4 text-primary" /> : <Moon className="size-4 text-primary" />} {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-muted-foreground hover:text-foreground">
                <LogOut className="size-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
function Library({ back }: { back: () => void }) {
  const [term, setTerm] = useState("");
  const [terms, setTerms] = useState<string[]>([]);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const savedTerms = window.localStorage.getItem("reviewer-terms");
    const savedFiles = window.localStorage.getItem("reviewer-files");
    if (savedTerms) setTerms(JSON.parse(savedTerms));
    if (savedFiles) setFiles(JSON.parse(savedFiles));
  }, []);

  const addTerm = () => {
    const value = term.trim();
    if (!value || terms.includes(value)) return;
    const next = [...terms, value];
    setTerms(next);
    window.localStorage.setItem("reviewer-terms", JSON.stringify(next));
    setTerm("");
  };

  const removeTerm = (value: string) => {
    const next = terms.filter((item) => item !== value);
    setTerms(next);
    window.localStorage.setItem("reviewer-terms", JSON.stringify(next));
  };

  const addFiles = (selected: FileList | null) => {
    if (!selected) return;
    const next = [
      ...files,
      ...Array.from(selected).map((file) => ({
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      })),
    ];
    setFiles(next);
    window.localStorage.setItem("reviewer-files", JSON.stringify(next));
  };

  const visibleTerms = terms.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pb-10">
      <button
        onClick={back}
        className="flex items-center gap-1 self-start text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> Back
      </button>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Content library
        </p>
        <h1 className="mt-2 text-3xl font-bold">Manage your reviewer</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Add the common terms and reviewer manuals you want to use while studying.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold">Common terms</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep important vocabulary close at hand.
              </p>
            </div>
            <BookOpen className="size-5 text-primary" />
          </div>
          <div className="mt-5 flex gap-2">
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) addTerm();
              }}
              placeholder="e.g. insurable interest"
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              aria-label="Common term"
            />
            <button
              onClick={addTerm}
              className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            {terms.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search terms"
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Search terms"
                />
              </div>
            )}
            {visibleTerms.length === 0 ? (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                No terms added yet. Start with the vocabulary you see most often.
              </p>
            ) : (
              visibleTerms.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm">
                  <span>{item}</span>
                  <button onClick={() => removeTerm(item)} aria-label={`Remove ${item}`} className="text-muted-foreground hover:text-foreground">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold">Reviewer files</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add manuals and reference material for your study library.
              </p>
            </div>
            <FileText className="size-5 text-primary" />
          </div>
          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/60 bg-primary/5 px-5 py-8 text-center hover:bg-primary/10">
            <FileText className="size-7 text-primary" />
            <span className="mt-3 text-sm font-semibold">Choose reviewer files</span>
            <span className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX, or TXT</span>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={(event) => addFiles(event.target.files)}
              className="sr-only"
            />
          </label>
          <div className="mt-5 flex flex-col gap-2">
            {files.length === 0 ? (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                No files added yet. Your reviewer manuals will appear here.
              </p>
            ) : (
              files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </main>
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
            <span className="mt-0.5 block text-xs text-muted-foreground">Add terms and manuals</span>
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
      {examTypes.map((type) => (
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
  mode: StudyMode;
  type: ExamType;
  back: () => void;
  update: (mode: StudyMode, value: number) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchExamQuestions(type)
      .then((items) => {
        if (!active) return;
        setQuestions(shuffled(items));
        setIndex(0);
        setRevealed(false);
        setSelected(null);
        setChecked(false);
        setWrong([]);
      })
      .catch(() => {
        if (!active) return;
        setQuestions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type]);

  const question = questions[index];
  const correct = question?.choices.find((choice) => choice.is_correct)?.id;
  const scramble = () => {
    setQuestions((current) => shuffled(current.length ? current : []));
    setIndex(0);
    setRevealed(false);
    setSelected(null);
    setChecked(false);
    setWrong([]);
  };
  const next = () => {
    if (!question) return;
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
    if (!selected || !question || !correct) return;
    setChecked(true);
    if (selected !== correct && !wrong.some((q) => q.id === question.id))
      setWrong((items) => [...items, question]);
    else if (selected === correct)
      setWrong((items) => items.filter((q) => q.id !== question.id));
  };

  if (loading) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10">
        <Card>
          <p className="text-sm text-muted-foreground">Loading questions...</p>
        </Card>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10">
        <Card>
          <p className="text-sm text-muted-foreground">
            No questions are available for this exam right now.
          </p>
        </Card>
      </main>
    );
  }

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
            {question.category}
          </p>
          <h1 className="mt-6 text-xl font-semibold leading-8">
            {question.text}
          </h1>
          {mode === "flashcard" && (
            <div className="mt-8 rounded-2xl bg-muted p-4 text-sm leading-6">
              {revealed ? (
                <>
                  <strong>Answer:</strong>{" "}
                  {question.choices.find((choice) => choice.is_correct)?.text}
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
              {question.choices.map((choice, i) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(choice.id);
                  }}
                  className={`rounded-2xl border p-4 text-left ${selected === choice.id ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <span className="mr-3 font-mono text-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {choice.text}
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
  update: (mode: StudyMode, value: number) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<Question["id"], string>>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchExamQuestions(type)
      .then((items) => {
        if (!active) return;
        setQuestions(shuffled(items));
        setAnswers({});
        setFinished(false);
      })
      .catch(() => {
        if (!active) return;
        setQuestions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [type]);

  const score = questions.filter((questionItem) => {
    const correctId = questionItem.choices.find((choice) => choice.is_correct)?.id;
    return answers[questionItem.id] === correctId;
  }).length;
  const scramble = () => {
    setQuestions((current) => shuffled(current.length ? current : []));
    setAnswers({});
    setFinished(false);
  };
  const submit = () => {
    if (questions.every((q) => answers[q.id])) {
      update("practice", Math.round((score / questions.length) * 100));
      setFinished(true);
    }
  };
  if (loading) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-10 pt-10">
        <Card>
          <p className="text-sm text-muted-foreground">Loading practice questions...</p>
        </Card>
      </main>
    );
  }

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
            <h2 className="font-semibold">{q.text}</h2>
            <p className="mt-3 text-sm text-emerald-400">
              <strong>Correct answer:</strong>{" "}
              {q.choices.find((choice) => choice.is_correct)?.text}
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
          <h2 className="mt-3 font-semibold leading-7">{q.text}</h2>
          <div className="mt-4 flex flex-col gap-3">
            {q.choices.map((choice, j) => (
              <button
                key={choice.id}
                onClick={() => setAnswers((v) => ({ ...v, [q.id]: choice.id }))}
                className={`rounded-2xl border p-4 text-left ${answers[q.id] === choice.id ? "border-primary bg-primary/10" : "border-border"}`}
              >
                <span className="mr-3 font-mono text-xs">
                  {String.fromCharCode(65 + j)}
                </span>
                {choice.text}
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
      {examTypes.map((type) => (
        <Card key={type}>
          <h2 className="text-xl font-bold">{examLabels[type]}</h2>
          <div className="mt-5 flex flex-col gap-4">
            {studyModes.map((mode) => (
              <div key={mode}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{modeLabels[mode]}</span>
                  <strong>{data[type][mode]}%</strong>
                </div>
                <ProgressBar
                  value={data[type][mode]}
                  blue={type === "TRADITIONAL_LIFE"}
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
  const [screen, setScreen] = useState<
    "dashboard" | "progress" | "library" | "flashcard" | "memorize" | "practice"
  >("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [type, setType] = useState<ExamType | null>(null);
  const [progress, setProgress] = useState(initialProgress);
  useEffect(() => {
    const saved = window.localStorage.getItem("reviewer-progress");
    if (saved) setProgress(JSON.parse(saved));
    const savedTheme = window.localStorage.getItem("reviewer-theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem("reviewer-theme", theme);
  }, [theme]);
  const update = (
    exam: ExamType,
    mode: StudyMode,
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
        theme={theme}
        toggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        progress={() => {
          setMode(null);
          setType(null);
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
      {screen === "library" && <Library back={home} />}
    </div>
  );
}
