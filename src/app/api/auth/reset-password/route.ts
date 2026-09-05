import pool from "@/lib/db";
import { hashResetToken, isTokenUsable } from "@/lib/helper/reset-token";
import { resetPasswordSchema } from "@/lib/validation/auth.validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const INVALID_TOKEN =
  "This reset link is invalid or has expired. Please request a new one.";

export async function POST(req: Request) {
  try {
    const parsed = resetPasswordSchema.safeParse(
      await req.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;
    const tokenHash = hashResetToken(token);

    const found = await pool.query(
      `SELECT id, user_id, expires_at, used_at
       FROM password_reset_tokens WHERE token_hash = $1`,
      [tokenHash],
    );

    const record = found.rows[0];

    if (
      !record ||
      !isTokenUsable({
        expiresAt: new Date(record.expires_at),
        usedAt: record.used_at ? new Date(record.used_at) : null,
      })
    ) {
      return NextResponse.json({ error: INVALID_TOKEN }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Spending the token conditionally means two submissions of the same link
      // cannot both succeed.
      const spent = await client.query(
        `UPDATE password_reset_tokens SET used_at = now()
         WHERE id = $1 AND used_at IS NULL AND expires_at > now()`,
        [record.id],
      );

      if (spent.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: INVALID_TOKEN }, { status: 400 });
      }

      await client.query(
        `UPDATE users SET password = $1, updated_at = now() WHERE id = $2`,
        [hashedPassword, record.user_id],
      );

      await client.query("COMMIT");
    } catch (dbError) {
      await client.query("ROLLBACK").catch(() => {});
      throw dbError;
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: "Your password has been reset. You can sign in now.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
