"use client";

import { AppNav } from "@/components/ui/app-nav";
import { examLabels, type ExamType } from "@/lib/types/common";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Term = {
  id: string;
  exam_type: ExamType;
  term: string;
  definition: string;
};

export function GlossaryPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/glossary")
      .then((response) => response.json())
      .then((data: Term[]) => {
        if (active) setTerms(Array.isArray(data) ? data : []);
      })
      .catch(() => active && setTerms([]))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  // Filtering client-side keeps typing instant; the list is small by nature.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return terms;
    return terms.filter(
      (item) =>
        item.term.toLowerCase().includes(needle) ||
        item.definition.toLowerCase().includes(needle),
    );
  }, [terms, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />

      <main className="rv-shell py-8">
        <section className="rounded-xl bg-[#0B2340] p-9 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg">
              <h1 className="text-4xl font-extrabold md:text-5xl">
                Insurance Glossary
              </h1>
              <p className="mt-3 text-sm text-white/75">
                Master the terminology required for your licensing exams. Search
                or browse key terms below.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <Search
                className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-[#0B2340]/50"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search glossary terms"
                placeholder="Search terms..."
                className="w-full rounded-lg bg-white py-3 pl-10 pr-3 text-sm text-[#10151F] outline-none placeholder:text-[#A9A092] focus:ring-2 focus:ring-[#FFD400]"
              />
            </div>
          </div>
        </section>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading terms…</p>
        ) : visible.length === 0 ? (
          <div className="rv-card mt-8 p-8 text-center">
            <p className="font-bold">
              {terms.length === 0
                ? "No glossary terms have been added yet."
                : `No terms match “${query}”.`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {terms.length === 0
                ? "Terms added to the vocabulary library will appear here."
                : "Try a shorter search."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <article key={item.id} className="rv-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-extrabold">{item.term}</h2>
                  <span className="shrink-0 rounded-full bg-[#0B2340] px-2.5 py-1 text-[10px] font-bold text-[#FFD400]">
                    {examLabels[item.exam_type]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.definition}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
