import { streakMilestone } from "./streaks";

const praise = [
  "Nailed it.",
  "Exactly right.",
  "That's the one.",
  "Sharp work.",
  "Locked in.",
  "Clean answer.",
];

const encouragement = [
  "Close one — take a look at why.",
  "Not quite. This one's worth a second pass.",
  "Missed it, but now you know it.",
  "That's a tricky one. Read the correct answer carefully.",
  "No problem — this is exactly what review is for.",
];

const milestoneMessages: Record<number, string> = {
  5: "Five in a row. You're on a roll.",
  10: "Ten straight — that's real mastery building.",
  25: "Twenty-five in a row. Outstanding run.",
};

function pick(pool: string[], seed: number): string {
  return pool[Math.abs(seed) % pool.length];
}

export type AnswerMood = "correct" | "incorrect";

export type MotivationMessage = {
  mood: AnswerMood;
  headline: string;
  /** Milestones earn a bigger celebration than an ordinary correct answer. */
  milestone: number | null;
};

/**
 * The message shown right after an answer. `seed` keeps the choice stable for a
 * given question instead of reshuffling on every re-render — pass the index.
 */
export function motivationFor(
  isCorrect: boolean,
  streakAfterAnswer: number,
  seed: number,
): MotivationMessage {
  if (!isCorrect) {
    return {
      mood: "incorrect",
      headline: pick(encouragement, seed),
      milestone: null,
    };
  }

  const milestone = streakMilestone(streakAfterAnswer);

  return {
    mood: "correct",
    headline: milestone ? milestoneMessages[milestone] : pick(praise, seed),
    milestone,
  };
}
