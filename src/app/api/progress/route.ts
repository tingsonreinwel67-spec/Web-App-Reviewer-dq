import pool from "@/src/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  try {
    const query = `
      WITH flashcard_stats AS (
        SELECT 
          f.exam_type,
          COUNT(f.id) AS total,
          COUNT(fp.id) FILTER (WHERE fp.mastered = true) AS mastered
        FROM flashcards f
        LEFT JOIN flashcard_progress fp 
          ON fp.flashcard_id = f.id AND fp.user_id = $1
        GROUP BY f.exam_type
      ),
      memorization_stats AS (
        SELECT 
          m.exam_type,
          COUNT(m.id) AS total,
          COUNT(mp.id) FILTER (WHERE mp.mastered = true) AS mastered
        FROM memorization m
        LEFT JOIN memorization_progress mp 
          ON mp.memorization_id = m.id AND mp.user_id = $1
        GROUP BY m.exam_type
      ),
      question_stats AS (
        SELECT 
          q.exam_type,
          COUNT(q.id) AS total,
          COUNT(qp.id) FILTER (WHERE qp.mastered = true) AS mastered
        FROM questions q
        LEFT JOIN question_progress qp 
          ON qp.question_id = q.id AND qp.user_id = $1
        GROUP BY q.exam_type
      )
      SELECT 
        COALESCE(f.exam_type, m.exam_type, q.exam_type) AS exam_type,
        COALESCE(f.total, 0) AS flashcard_total,
        COALESCE(f.mastered, 0) AS flashcard_mastered,
        COALESCE(m.total, 0) AS memorize_total,
        COALESCE(m.mastered, 0) AS memorize_mastered,
        COALESCE(q.total, 0) AS practice_total,
        COALESCE(q.mastered, 0) AS practice_mastered
      FROM flashcard_stats f
      FULL OUTER JOIN memorization_stats m ON m.exam_type = f.exam_type
      FULL OUTER JOIN question_stats q ON q.exam_type = COALESCE(f.exam_type, m.exam_type)
    `;

    const result = await pool.query(query, [userId]);

    const summary = result.rows.map((row) => {
      const flashcardPct =
        row.flashcard_total > 0
          ? (row.flashcard_mastered / row.flashcard_total) * 100
          : 0;
      const memorizePct =
        row.memorize_total > 0
          ? (row.memorize_mastered / row.memorize_total) * 100
          : 0;
      const practicePct =
        row.practice_total > 0
          ? (row.practice_mastered / row.practice_total) * 100
          : 0;
      const overallPct = (flashcardPct + memorizePct + practicePct) / 3;

      return {
        exam_type: row.exam_type,
        flashcard_pct: Math.round(flashcardPct),
        memorize_pct: Math.round(memorizePct),
        practice_exam_pct: Math.round(practicePct),
        overall_pct: Math.round(overallPct),
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching progress summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress summary" },
      { status: 500 },
    );
  }
}
