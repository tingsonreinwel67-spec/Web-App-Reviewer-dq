import pool from "@/lib/db";
import { Memorization } from "@/lib/types/memo";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const examType = searchParams.get("exam_type");
  const category = searchParams.get("category");

  try {
    let query = `
      SELECT 
        m.id,
        m.exam_type,
        m.category,
        m.text,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'text', c.text,
              'is_correct', c.is_correct
            )
          ) FILTER (WHERE c.id IS NOT NULL), '[]'
        ) AS choices
      FROM memorization m
      LEFT JOIN memorization_choices c ON c.memorization_id = m.id
    `;

    const conditions: string[] = [];
    const values: string[] = [];

    if (examType) {
      values.push(examType);
      conditions.push(`m.exam_type = $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`m.category = $${values.length}`);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY m.id ORDER BY m.text ASC`;

    const result = await pool.query<Memorization>(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching memorization:", error);
    return NextResponse.json(
      { error: "Failed to fetch memorization" },
      { status: 500 },
    );
  }
}
