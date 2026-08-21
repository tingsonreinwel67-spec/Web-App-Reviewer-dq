import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const examType = searchParams.get("exam_type");

  if (!userId || !examType) {
    return NextResponse.json(
      { error: "user_id and exam_type are required" },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `SELECT 
         COUNT(m.id) AS total,
         COUNT(mp.id) FILTER (WHERE mp.mastered = true) AS mastered
       FROM memorization m
       LEFT JOIN memorization_progress mp 
         ON mp.memorization_id = m.id AND mp.user_id = $1
       WHERE m.exam_type = $2`,
      [userId, examType],
    );

    const { total, mastered } = result.rows[0];
    const eligible = Number(total) > 0 && Number(total) === Number(mastered);

    return NextResponse.json({
      eligible,
      total: Number(total),
      mastered: Number(mastered),
    });
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 },
    );
  }
}
