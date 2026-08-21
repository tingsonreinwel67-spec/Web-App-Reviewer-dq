import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: flashcardId } = await params;

  try {
    const body = await req.json();
    const { user_id, mastered } = body;

    if (!user_id || typeof mastered !== "boolean") {
      return NextResponse.json(
        { error: "user_id and mastered (boolean) are required" },
        { status: 400 },
      );
    }

    // Confirm the flashcard actually exists
    const cardCheck = await pool.query(
      `SELECT id FROM flashcards WHERE id = $1`,
      [flashcardId],
    );

    if (cardCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 },
      );
    }

    const result = await pool.query(
      `INSERT INTO flashcard_progress 
        (user_id, flashcard_id, reviewed_at, mastered)
       VALUES ($1, $2, now(), $3)
       ON CONFLICT (user_id, flashcard_id) 
       DO UPDATE SET 
         reviewed_at = now(),
         mastered = EXCLUDED.mastered
       RETURNING *`,
      [user_id, flashcardId, mastered],
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error submitting flashcard review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
