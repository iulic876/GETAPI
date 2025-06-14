import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  verifyToken(token); // still verify, but don't use userId
  const { collectionId, name, method, url } = await req.json();

  if (!name || !method || !url) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "INSERT INTO requests (collection_id, name, method, url) VALUES ($1, $2, $3, $4) RETURNING *",
      [collectionId || null, name, method, url]
    );
    return NextResponse.json({ request: result.rows[0] });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
