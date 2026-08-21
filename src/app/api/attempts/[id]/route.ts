import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const attemptResult = await pool.query(
      `SELECT * FROM exam_attempts WHERE id = $1`,
      [id],
    );

    if (attemptResult.rows.length === 0) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const answersResult = await pool.query(
      `SELECT 
         a.id, a.question_id, a.selected_choice_id, a.is_correct,
         q.text AS question_text
       FROM exam_attempt_answers a
       JOIN questions q ON q.id = a.question_id
       WHERE a.attempt_id = $1`,
      [id],
    );

    return NextResponse.json({
      ...attemptResult.rows[0],
      answers: answersResult.rows,
    });
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 },
    );
  }
}
