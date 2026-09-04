export type Streak = {
  current: number;
  best: number;
};

export type StreakUpdate = Streak & {
  isNewBest: boolean;
};

/** Streak lengths that earn a celebration. */
export const STREAK_MILESTONES = [5, 10, 25] as const;

/**
 * A correct answer extends the run; a wrong answer ends it. The best streak is a
 * high-water mark, so it only ever rises.
 */
export function nextStreak(streak: Streak, isCorrect: boolean): StreakUpdate {
  if (!isCorrect) {
    return { current: 0, best: streak.best, isNewBest: false };
  }

  const current = streak.current + 1;
  const isNewBest = current > streak.best;

  return {
    current,
    best: isNewBest ? current : streak.best,
    isNewBest,
  };
}

/** The milestone a streak just landed on, or null if it landed between them. */
export function streakMilestone(current: number): number | null {
  return STREAK_MILESTONES.find((milestone) => milestone === current) ?? null;
}
