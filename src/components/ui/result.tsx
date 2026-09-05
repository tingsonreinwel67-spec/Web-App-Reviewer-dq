import { ResultProps } from "@/lib/types/attempt";

export function Result({
  correct = 0,
  wrong = 0,
  onTryAgain,
  onRedoMistakes,
}: ResultProps) {
  const total = correct + wrong;
  const score = total ? Math.round((correct / total) * 100) : 0;

  const closing =
    score === 100
      ? "A perfect run. That material is yours."
      : score >= 80
        ? "Strong session — you're close to mastery."
        : score >= 50
          ? "Solid progress. Another pass will lock it in."
          : "Every miss is a card you now know to review.";

  return (
    <section className="rv-card p-7 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-[#8A6D0B]">
        Session complete
      </p>
      <h1 className="mt-3 text-4xl font-extrabold">{score}% correct</h1>
      <p className="mt-2 text-sm text-muted-foreground">{closing}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 text-left">
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Correct
          </p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-700">
            {correct}
          </p>
        </div>
        <div className="rounded-lg bg-rose-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Wrong
          </p>
          <p className="mt-1 text-2xl font-extrabold text-rose-700">{wrong}</p>
        </div>
      </div>

      {(onTryAgain || onRedoMistakes) && (
        <div className="mt-6 flex flex-col gap-3">
          {onTryAgain && (
            <button
              onClick={onTryAgain}
              className="rounded-lg bg-[#FFD400] px-5 py-3 font-bold text-[#0B2340] transition hover:bg-[#E8C200]"
            >
              Try again
            </button>
          )}
          {onRedoMistakes && (
            <button
              onClick={onRedoMistakes}
              disabled={!wrong}
              className="rounded-lg border border-border px-5 py-3 font-bold transition hover:border-[#C9A227] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Redo mistakes ({wrong})
            </button>
          )}
        </div>
      )}
    </section>
  );
}
