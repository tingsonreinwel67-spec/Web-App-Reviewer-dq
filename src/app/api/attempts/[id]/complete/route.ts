import { auth } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

const PASSING_PERCENTAGE = 75;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: attemptId } = await params;

  try {
    // fetch the attempt first to check ownership before mutating anything
    const attemptCheck = await pool.query(
      `SELECT user_id FROM exam_attempts WHERE id = $1`,
      [attemptId],
    );

    if (attemptCheck.rows.length === 0) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attemptCheck.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const answersResult = await pool.query(
      `SELECT is_correct FROM exam_attempt_answers WHERE attempt_id = $1`,
      [attemptId],
    );

    const totalItems = answersResult.rows.length;
    const score = answersResult.rows.filter((r) => r.is_correct).length;
    const percentage = totalItems > 0 ? (score / totalItems) * 100 : 0;
    const passed = percentage >= PASSING_PERCENTAGE;

    const result = await pool.query(
      `UPDATE exam_attempts 
       SET score = $1, total_items = $2, passed = $3, completed_at = now()
       WHERE id = $4
       RETURNING *`,
      [score, totalItems, passed, attemptId],
    );

    const attempt = result.rows[0];

    if (passed) {
      await pool.query(
        `INSERT INTO user_progress (user_id, exam_type, pass_count)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, exam_type)
         DO UPDATE SET pass_count = user_progress.pass_count + 1, updated_at = now()`,
        [attempt.user_id, attempt.exam_type],
      );
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Error completing attempt:", error);
    return NextResponse.json(
      { error: "Failed to complete attempt" },
      { status: 500 },
    );
  }
}
