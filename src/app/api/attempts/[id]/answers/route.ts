import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id: attemptId } = params;

  try {
    const body = await req.json();
    const { question_id, selected_choice_id } = body;

    if (!question_id || !selected_choice_id) {
      return NextResponse.json(
        { error: "question_id and selected_choice_id are required" },
        { status: 400 },
      );
    }

    const choiceResult = await pool.query(
      `SELECT is_correct FROM choices WHERE id = $1 AND question_id = $2`,
      [selected_choice_id, question_id],
    );

    if (choiceResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Choice not found for this question" },
        { status: 404 },
      );
    }

    const isCorrect = choiceResult.rows[0].is_correct;

    const result = await pool.query(
      `INSERT INTO exam_attempt_answers 
        (attempt_id, question_id, selected_choice_id, is_correct)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [attemptId, question_id, selected_choice_id, isCorrect],
    );

    // Also update the user's cumulative question_progress
    const attempt = await pool.query(
      `SELECT user_id FROM exam_attempts WHERE id = $1`,
      [attemptId],
    );
    const userId = attempt.rows[0]?.user_id;

    if (userId) {
      await pool.query(
        `INSERT INTO question_progress 
          (user_id, question_id, selected_choice_id, is_correct, times_seen, times_correct, mastered, last_reviewed_at)
         VALUES ($1, $2, $3, $4, 1, $5, $4, now())
         ON CONFLICT (user_id, question_id)
         DO UPDATE SET
           selected_choice_id = EXCLUDED.selected_choice_id,
           is_correct = EXCLUDED.is_correct,
           times_seen = question_progress.times_seen + 1,
           times_correct = question_progress.times_correct + EXCLUDED.times_correct,
           mastered = EXCLUDED.is_correct,
           last_reviewed_at = now()`,
        [userId, question_id, selected_choice_id, isCorrect, isCorrect ? 1 : 0],
      );
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 },
    );
  }
}
