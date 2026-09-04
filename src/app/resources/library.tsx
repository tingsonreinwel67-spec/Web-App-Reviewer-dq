"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      {children}
    </section>
  );
}

export function Library({ back }: { back: () => void }) {
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
          Add the common terms and reviewer manuals you want to use while
          studying.
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
                if (
                  event.key === "Enter" &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                )
                  addTerm();
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
                No terms added yet. Start with the vocabulary you see most
                often.
              </p>
            ) : (
              visibleTerms.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeTerm(item)}
                    aria-label={`Remove ${item}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
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
            <span className="mt-3 text-sm font-semibold">
              Choose reviewer files
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PDF, DOC, DOCX, or TXT
            </span>
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
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
                >
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
