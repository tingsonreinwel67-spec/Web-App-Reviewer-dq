import { describe, expect, it } from "vitest";
import { restoreSession, type SavedSession } from "./study-session";

const deck = ["a", "b", "c", "d", "e"];

const saved = (overrides: Partial<SavedSession> = {}): SavedSession => ({
  card_order: deck,
  card_index: 2,
  ratings: { a: true, b: false },
  ...overrides,
});

describe("restoreSession", () => {
  it("starts a fresh shuffled deck when nothing was saved", () => {
    const restored = restoreSession(deck, null);

    expect(restored.resumed).toBe(false);
    expect(restored.index).toBe(0);
    expect(restored.ratings).toEqual({});
    expect([...restored.order].sort()).toEqual([...deck].sort());
  });

  it("resumes at the saved position with the saved order", () => {
    const restored = restoreSession(deck, saved({ card_order: ["c", "a", "b", "d", "e"] }));

    expect(restored.resumed).toBe(true);
    expect(restored.index).toBe(2);
    expect(restored.order).toEqual(["c", "a", "b", "d", "e"]);
    expect(restored.ratings).toEqual({ a: true, b: false });
  });

  it("does not resume a session that was already on the first card", () => {
    expect(restoreSession(deck, saved({ card_index: 0, ratings: {} })).resumed).toBe(
      false,
    );
  });

  it("drops cards that no longer exist in the deck", () => {
    const restored = restoreSession(deck, saved({ card_order: ["a", "gone", "b", "c", "d", "e"] }));

    expect(restored.order).toEqual(["a", "b", "c", "d", "e"]);
    expect(restored.order).not.toContain("gone");
  });

  it("shifts the index back when a removed card sat before it", () => {
    // Saved position was card 3 of 6 ("b"); "gone" disappeared from in front of it.
    const restored = restoreSession(deck, saved({
      card_order: ["a", "gone", "b", "c", "d", "e"],
      card_index: 2,
    }));

    expect(restored.order[restored.index]).toBe("b");
    expect(restored.index).toBe(1);
  });

  it("appends cards added to the deck since the session was saved", () => {
    const restored = restoreSession([...deck, "f"], saved());

    expect(restored.order).toEqual([...deck, "f"]);
    expect(restored.index).toBe(2);
  });

  it("drops ratings for cards no longer in the deck", () => {
    const restored = restoreSession(["a", "c"], saved({ card_order: ["a", "b", "c"] }));

    expect(restored.ratings).toEqual({ a: true });
  });

  it("clamps an index that now sits past the end of the deck", () => {
    const restored = restoreSession(["a", "b"], saved({ card_order: deck, card_index: 4 }));

    expect(restored.index).toBe(1);
  });

  it("starts fresh when every saved card is gone", () => {
    const restored = restoreSession(deck, saved({ card_order: ["x", "y"], card_index: 1 }));

    expect(restored.resumed).toBe(false);
    expect([...restored.order].sort()).toEqual([...deck].sort());
  });

  it("starts fresh when the saved deck was finished", () => {
    const restored = restoreSession(deck, saved({ card_index: 5 }));

    expect(restored.resumed).toBe(false);
    expect(restored.index).toBe(0);
    expect(restored.ratings).toEqual({});
  });
});
