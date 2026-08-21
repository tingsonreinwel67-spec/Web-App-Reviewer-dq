import pool from "@/lib/db";
import { Flashcard } from "@/lib/types/flashcard";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const examType = searchParams.get("exam_type");
  const category = searchParams.get("category");

  try {
    let query = `
      SELECT id, exam_type, category, front, back
      FROM flashcards
    `;

    const conditions: string[] = [];
    const values: string[] = [];

    if (examType) {
      values.push(examType);
      conditions.push(`exam_type = $${values.length}`);
    }

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY category ASC`;

    const result = await pool.query<Flashcard>(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 },
    );
  }
}
