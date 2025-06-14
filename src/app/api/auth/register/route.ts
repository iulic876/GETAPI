import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (typeof existingUser.rowCount === "number" && existingUser.rowCount > 0) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await pool.query(
    "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
    [email, hashedPassword, name || null]
  );

  const token = signToken({ userId: newUser.rows[0].id });

  const res = NextResponse.json({ user: newUser.rows[0] });
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
