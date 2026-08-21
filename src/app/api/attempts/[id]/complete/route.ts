import pool from "@/src/lib/db";
import { NextResponse } from "next/server";

const PASSING_PERCENTAGE = 75;

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id: attemptId } = params;

  try {
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

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const attempt = result.rows[0];

    // If passed, bump user_progress.pass_count
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
