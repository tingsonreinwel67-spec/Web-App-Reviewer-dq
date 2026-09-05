/**
 * Resume logic for a study deck.
 *
 * A session stores the shuffled order the learner saw plus how far they got, so
 * reopening a track continues at "Card 5 of 20" instead of dealing a new deck
 * from the top. The saved order can be stale — cards get added, edited away, or
 * moved to another track between sittings — so restoring reconciles it against
 * the deck the server just returned.
 */

export type SavedSession = {
  card_order: string[];
  card_index: number;
  ratings: Record<string, boolean>;
};

export type RestoredSession = {
  order: string[];
  index: number;
  ratings: Record<string, boolean>;
  /** False when the learner starts over: a fresh shuffle, card 1. */
  resumed: boolean;
};

const shuffle = (ids: string[]) => [...ids].sort(() => Math.random() - 0.5);

const fresh = (deck: string[]): RestoredSession => ({
  order: shuffle(deck),
  index: 0,
  ratings: {},
  resumed: false,
});

export function restoreSession(
  deck: string[],
  saved: SavedSession | null,
): RestoredSession {
  if (!saved || deck.length === 0) return fresh(deck);

  const available = new Set(deck);
  const savedOrder = saved.card_order.filter((id) => available.has(id));

  // Nothing recognisable left to resume into.
  if (savedOrder.length === 0) return fresh(deck);

  // The card the learner stopped on, before any reconciliation moves it.
  const stoppedOn = saved.card_order[saved.card_index];

  const seen = new Set(savedOrder);
  const order = [...savedOrder, ...deck.filter((id) => !seen.has(id))];

  // Prefer the exact card; fall back to the saved position clamped into range
  // when that card is gone.
  const index =
    stoppedOn !== undefined && order.includes(stoppedOn)
      ? order.indexOf(stoppedOn)
      : Math.min(Math.max(saved.card_index, 0), order.length - 1);

  // A session parked on card 1 with nothing rated, or one that ran off the end
  // of its deck, has no progress worth resuming.
  const finished = saved.card_index >= saved.card_order.length;
  const ratings = Object.fromEntries(
    Object.entries(saved.ratings).filter(([id]) => available.has(id)),
  );

  if (finished || (index === 0 && Object.keys(ratings).length === 0)) {
    return fresh(deck);
  }

  return { order, index, ratings, resumed: true };
}
