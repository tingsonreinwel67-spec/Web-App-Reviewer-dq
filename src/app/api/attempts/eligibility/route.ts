import { auth } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { exam_type } = body;

    if (!exam_type) {
      return NextResponse.json(
        { error: "exam_type is required" },
        { status: 400 },
      );
    }

    const [flashcardCheck, memoCheck] = await Promise.all([
      pool.query(
        `SELECT COUNT(f.id) AS total, COUNT(fp.id) FILTER (WHERE fp.mastered = true) AS mastered
         FROM flashcards f
         LEFT JOIN flashcard_progress fp ON fp.flashcard_id = f.id AND fp.user_id = $1
         WHERE f.exam_type = $2`,
        [session.user.id, exam_type],
      ),
      pool.query(
        `SELECT COUNT(m.id) AS total, COUNT(mp.id) FILTER (WHERE mp.mastered = true) AS mastered
         FROM memorization m
         LEFT JOIN memorization_progress mp ON mp.memorization_id = m.id AND mp.user_id = $1
         WHERE m.exam_type = $2`,
        [session.user.id, exam_type],
      ),
    ]);

    const fc = flashcardCheck.rows[0];
    const memo = memoCheck.rows[0];
    const flashcardsEligible =
      Number(fc.total) > 0 && Number(fc.total) === Number(fc.mastered);
    const memoEligible =
      Number(memo.total) > 0 && Number(memo.total) === Number(memo.mastered);

    if (!flashcardsEligible || !memoEligible) {
      return NextResponse.json(
        {
          error:
            "Complete all flashcards and memorization items with 100% mastery before taking the practice exam",
        },
        { status: 403 },
      );
    }

    const result = await pool.query(
      `INSERT INTO exam_attempts (user_id, exam_type, score, total_items, passed)
       VALUES ($1, $2, 0, 0, false)
       RETURNING *`,
      [session.user.id, exam_type],
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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examType = searchParams.get("exam_type");

  try {
    let query = `SELECT * FROM exam_attempts WHERE user_id = $1`;
    const values: string[] = [session.user.id];

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
