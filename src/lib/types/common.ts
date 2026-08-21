export type ExamType = "VUL" | "TRADITIONAL_LIFE";

export const examTypes: readonly ExamType[] = ["VUL", "TRADITIONAL_LIFE"];

export const examLabels: Record<ExamType, string> = {
	VUL: "VUL",
	TRADITIONAL_LIFE: "Traditional Life",
};
