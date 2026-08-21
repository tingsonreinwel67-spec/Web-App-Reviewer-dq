import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id"); // swap for session once auth exists
  const examType = searchParams.get("exam_type");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  try {
    const query = `
      SELECT 
        f.exam_type,
        COUNT(f.id) AS total,
        COUNT(fp.id) FILTER (WHERE fp.mastered = true) AS mastered
      FROM flashcards f
      LEFT JOIN flashcard_progress fp 
        ON fp.flashcard_id = f.id AND fp.user_id = $1
      ${examType ? "WHERE f.exam_type = $2" : ""}
      GROUP BY f.exam_type
    `;

    const values = examType ? [userId, examType] : [userId];
    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching flashcard progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}
