import { ResultProps } from "@/lib/types/attempt";

export function Result({ correct = 0, wrong = 0, onTryAgain, onRedoMistakes }: ResultProps) {
  const total = correct + wrong;
  const score = total ? Math.round((correct / total) * 100) : 0;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">Session complete</p>
      <h1 className="mt-3 text-3xl font-bold">{score}% correct</h1>
      <p className="mt-2 text-sm text-muted-foreground">Here&apos;s how you did this session.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 text-left">
        <div className="rounded-2xl bg-emerald-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Correct</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correct}</p>
        </div>
        <div className="rounded-2xl bg-rose-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wrong</p>
          <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{wrong}</p>
        </div>
      </div>
      {(onTryAgain || onRedoMistakes) && <div className="mt-6 flex flex-col gap-3">
        {onTryAgain && <button onClick={onTryAgain} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">Try again</button>}
        {onRedoMistakes && <button onClick={onRedoMistakes} disabled={!wrong} className="rounded-xl border border-border px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50">Redo mistakes ({wrong})</button>}
      </div>}
    </section>
  );
}
