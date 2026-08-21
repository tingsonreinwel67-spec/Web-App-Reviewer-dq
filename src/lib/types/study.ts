export type StudyMode = "flashcard" | "memorize" | "practice";

export const studyModes: readonly StudyMode[] = [
	"flashcard",
	"memorize",
	"practice",
];

export const modeLabels: Record<StudyMode, string> = {
	flashcard: "Flashcard",
	memorize: "Memorize",
	practice: "Practice",
};
