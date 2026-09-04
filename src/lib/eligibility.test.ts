import { describe, expect, it } from "vitest";
import { deriveEligibility, lockReason } from "./eligibility";

const counts = (mastered: number, total: number) => ({ mastered, total });

describe("deriveEligibility", () => {
  it("is eligible when every flashcard and memorization item is mastered", () => {
    const result = deriveEligibility(counts(40, 40), counts(40, 40));
    expect(result.eligible).toBe(true);
  });

  it("is not eligible while flashcards remain", () => {
    expect(deriveEligibility(counts(39, 40), counts(40, 40)).eligible).toBe(
      false,
    );
  });

  it("is not eligible while memorization items remain", () => {
    expect(deriveEligibility(counts(40, 40), counts(12, 40)).eligible).toBe(
      false,
    );
  });

  it("is not eligible when a track has no content at all", () => {
    // Zero of zero is vacuously complete, but an empty track is not a
    // meaningful qualification to sit the exam.
    expect(deriveEligibility(counts(0, 0), counts(0, 0)).eligible).toBe(false);
  });

  it("is not eligible when only one side has content", () => {
    expect(deriveEligibility(counts(40, 40), counts(0, 0)).eligible).toBe(false);
  });
});

describe("lockReason", () => {
  it("names both outstanding areas with their counts", () => {
    const reason = lockReason(counts(18, 40), counts(12, 40));
    expect(reason).toBe(
      "Finish flashcards (18/40) and memorize (12/40) to unlock.",
    );
  });

  it("names only the outstanding area when the other is complete", () => {
    expect(lockReason(counts(40, 40), counts(12, 40))).toBe(
      "Finish memorize (12/40) to unlock.",
    );
    expect(lockReason(counts(18, 40), counts(40, 40))).toBe(
      "Finish flashcards (18/40) to unlock.",
    );
  });

  it("explains an empty track rather than showing 0/0 counters", () => {
    expect(lockReason(counts(0, 0), counts(0, 0))).toBe(
      "No study material has been added for this track yet.",
    );
  });

  it("returns null when the track is already unlocked", () => {
    expect(lockReason(counts(40, 40), counts(40, 40))).toBeNull();
  });
});
