import { examLabels, examTypes, type ExamType } from "@/lib/types/common";
import { modeLabels, studyModes, type StudyMode } from "@/lib/types/study";

export type ProgressState = Record<ExamType, Record<StudyMode, number>>;

export function ProgressBar({
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

export function Progress({
	back,
	data,
}: {
	back: () => void;
	data: ProgressState;
}) {
	return (
		<main className="app-gutter app-safe-bottom mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
			<button onClick={back} className="-ml-1 min-h-11 self-start px-1 text-left text-sm text-muted-foreground">
				Back
			</button>
			<h1 className="text-display-sm font-bold">My Progress</h1>
			{examTypes.map((type) => (
				<section key={type} className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-3xl sm:p-5">
					<h2 className="text-lg font-bold sm:text-xl">{examLabels[type]}</h2>
					<div className="mt-5 flex flex-col gap-4">
						{studyModes.map((mode) => (
							<div key={mode}>
								<div className="mb-2 flex justify-between gap-3 text-sm">
									<span>{modeLabels[mode]}</span>
									<strong>{data[type][mode]}%</strong>
								</div>
								<ProgressBar value={data[type][mode]} blue={type === "TRADITIONAL_LIFE"} />
							</div>
						))}
					</div>
				</section>
			))}
		</main>
	);
}
