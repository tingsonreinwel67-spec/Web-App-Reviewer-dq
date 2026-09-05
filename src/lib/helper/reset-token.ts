import { createHash, randomBytes } from "crypto";

/** Reset links stay usable for one hour. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Only the hash is stored. A leaked database therefore yields no usable reset
 * links, and lookups still work because the hash is deterministic.
 */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken(now: Date = new Date()) {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MS),
  };
}

export function isTokenUsable(
  token: { expiresAt: Date; usedAt: Date | null },
  now: Date = new Date(),
): boolean {
  if (token.usedAt) return false;
  return token.expiresAt.getTime() > now.getTime();
}
