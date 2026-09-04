import { describe, expect, it } from "vitest";
import { nextStreak, streakMilestone } from "./streaks";

describe("nextStreak", () => {
  it("increments the current streak on a correct answer", () => {
    expect(nextStreak({ current: 3, best: 5 }, true)).toEqual({
      current: 4,
      best: 5,
      isNewBest: false,
    });
  });

  it("raises the best streak once the current streak passes it", () => {
    expect(nextStreak({ current: 5, best: 5 }, true)).toEqual({
      current: 6,
      best: 6,
      isNewBest: true,
    });
  });

  it("resets the current streak to zero on a wrong answer", () => {
    expect(nextStreak({ current: 7, best: 9 }, false)).toEqual({
      current: 0,
      best: 9,
      isNewBest: false,
    });
  });

  it("never lowers the best streak on a wrong answer", () => {
    expect(nextStreak({ current: 9, best: 9 }, false).best).toBe(9);
  });

  it("starts from zero for a user with no prior streak", () => {
    expect(nextStreak({ current: 0, best: 0 }, true)).toEqual({
      current: 1,
      best: 1,
      isNewBest: true,
    });
  });
});

describe("streakMilestone", () => {
  it("reports the milestone when the streak lands exactly on one", () => {
    expect(streakMilestone(5)).toBe(5);
    expect(streakMilestone(10)).toBe(10);
    expect(streakMilestone(25)).toBe(25);
  });

  it("reports nothing between milestones", () => {
    expect(streakMilestone(4)).toBeNull();
    expect(streakMilestone(11)).toBeNull();
    expect(streakMilestone(0)).toBeNull();
  });
});
