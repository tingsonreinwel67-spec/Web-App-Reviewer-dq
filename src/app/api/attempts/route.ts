import pool from "@/src/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, exam_type, type } = body;

    if (!user_id || !exam_type || !type) {
      return NextResponse.json(
        { error: "user_id, exam_type, and type are required" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO exam_attempts (user_id, exam_type, type, score, total_items, passed)
       VALUES ($1, $2, $3, 0, 0, false)
       RETURNING *`,
      [user_id, exam_type, type],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error starting attempt:", error);
    return NextResponse.json(
      { error: "Failed to start attempt" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const examType = searchParams.get("exam_type");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  try {
    let query = `SELECT * FROM exam_attempts WHERE user_id = $1`;
    const values: string[] = [userId];

    if (examType) {
      values.push(examType);
      query += ` AND exam_type = $${values.length}`;
    }

    query += ` ORDER BY started_at DESC`;

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 },
    );
  }
}
