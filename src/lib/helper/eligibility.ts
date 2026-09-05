import { Eligibility, MasteryCounts } from "../types/eligibility";

/** A section counts as complete only when it has content and all of it is mastered. */
function isComplete({ mastered, total }: MasteryCounts): boolean {
  return total > 0 && mastered >= total;
}

/**
 * The practice exam unlocks once every flashcard and every memorization item for
 * the track is mastered. A track with no content stays locked: zero of zero is
 * vacuously complete, but it is not a qualification.
 */
export function deriveEligibility(
  flashcards: MasteryCounts,
  memorization: MasteryCounts,
): Eligibility {
  return {
    eligible: isComplete(flashcards) && isComplete(memorization),
    flashcards,
    memorization,
  };
}

/** Plain-language explanation of what still stands between the user and the exam. */
export function lockReason(
  flashcards: MasteryCounts,
  memorization: MasteryCounts,
): string | null {
  if (deriveEligibility(flashcards, memorization).eligible) return null;

  if (flashcards.total === 0 && memorization.total === 0) {
    return "No study material has been added for this track yet.";
  }

  const outstanding: string[] = [];
  if (!isComplete(flashcards)) {
    outstanding.push(`flashcards (${flashcards.mastered}/${flashcards.total})`);
  }
  if (!isComplete(memorization)) {
    outstanding.push(
      `memorize (${memorization.mastered}/${memorization.total})`,
    );
  }

  return `Finish ${outstanding.join(" and ")} to unlock.`;
}
