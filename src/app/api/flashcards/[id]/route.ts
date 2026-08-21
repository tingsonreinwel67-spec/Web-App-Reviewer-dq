import pool from "@/src/lib/db";
import { Flashcard } from "@/src/lib/types/flashcard";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const result = await pool.query<Flashcard>(
      `SELECT id, exam_type, category, front, back 
       FROM flashcards WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcard" },
      { status: 500 },
    );
  }
}
