import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const examType = searchParams.get("exam_type");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  try {
    const query = `
      SELECT 
        m.exam_type,
        COUNT(m.id) AS total,
        COUNT(mp.id) FILTER (WHERE mp.mastered = true) AS mastered
      FROM memorization m
      LEFT JOIN memorization_progress mp 
        ON mp.memorization_id = m.id AND mp.user_id = $1
      ${examType ? "WHERE m.exam_type = $2" : ""}
      GROUP BY m.exam_type
    `;

    const values = examType ? [userId, examType] : [userId];
    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching memorization progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}
