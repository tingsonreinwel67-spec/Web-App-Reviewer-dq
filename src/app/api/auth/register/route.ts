import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string" ||
      !email.trim() ||
      !password ||
      !name.trim()
    ) {
      return NextResponse.json(
        { error: "email, password, and name are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        `INSERT INTO users (email, password, name, role)
         VALUES ($1, $2, $3, 'USER')
         RETURNING id, email, name, role, created_at`,
        [normalizedEmail, hashedPassword, name.trim()],
      );

      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (dbError: any) {
      // unique_violation on users.email
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 },
    );
  }
}
