import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "email, password, and name are required" },
        { status: 400 },
      );
    }

    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [
      email,
    ]);

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, 'USER')
       RETURNING id, email, name, role, created_at`,
      [email, hashedPassword, name],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 },
    );
  }
}
