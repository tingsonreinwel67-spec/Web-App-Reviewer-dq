import { describe, expect, it } from "vitest";
import {
  createResetToken,
  hashResetToken,
  isTokenUsable,
  RESET_TOKEN_TTL_MS,
} from "./reset-token";

describe("hashResetToken", () => {
  it("is deterministic for the same token", () => {
    expect(hashResetToken("abc")).toBe(hashResetToken("abc"));
  });

  it("differs for different tokens", () => {
    expect(hashResetToken("abc")).not.toBe(hashResetToken("abd"));
  });

  it("never returns the raw token", () => {
    expect(hashResetToken("abc")).not.toContain("abc");
  });
});

describe("createResetToken", () => {
  it("returns a token with its hash and a future expiry", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const created = createResetToken(now);

    expect(created.token).toHaveLength(64);
    expect(created.tokenHash).toBe(hashResetToken(created.token));
    expect(created.expiresAt.getTime()).toBe(
      now.getTime() + RESET_TOKEN_TTL_MS,
    );
  });

  it("does not repeat tokens", () => {
    expect(createResetToken().token).not.toBe(createResetToken().token);
  });
});

describe("isTokenUsable", () => {
  const now = new Date("2026-01-01T12:00:00Z");
  const future = new Date("2026-01-01T12:30:00Z");
  const past = new Date("2026-01-01T11:30:00Z");

  it("accepts an unused, unexpired token", () => {
    expect(isTokenUsable({ expiresAt: future, usedAt: null }, now)).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(isTokenUsable({ expiresAt: past, usedAt: null }, now)).toBe(false);
  });

  it("rejects a token that has already been used", () => {
    expect(isTokenUsable({ expiresAt: future, usedAt: past }, now)).toBe(false);
  });

  it("rejects a token expiring exactly now", () => {
    expect(isTokenUsable({ expiresAt: now, usedAt: null }, now)).toBe(false);
  });
});
