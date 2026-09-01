// app/api/flashcards/eligibility/route.ts
import { auth } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examType = searchParams.get("exam_type");

  if (!examType) {
    return NextResponse.json(
      { error: "exam_type is required" },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `SELECT 
         COUNT(f.id) AS total,
         COUNT(fp.id) FILTER (WHERE fp.mastered = true) AS mastered
       FROM flashcards f
       LEFT JOIN flashcard_progress fp 
         ON fp.flashcard_id = f.id AND fp.user_id = $1
       WHERE f.exam_type = $2`,
      [session.user.id, examType],
    );

    const { total, mastered } = result.rows[0];
    const eligible = Number(total) > 0 && Number(total) === Number(mastered);

    return NextResponse.json({
      eligible,
      total: Number(total),
      mastered: Number(mastered),
    });
  } catch (error) {
    console.error("Error checking flashcard eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 },
    );
  }
}
