import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { workspaceId, name } = await req.json();

  if (!workspaceId || !name) {
    return NextResponse.json(
      { error: "Missing workspaceId or name" },
      { status: 400 }
    );
  }

  // Verify membership
  const membership = await pool.query(
    "SELECT * FROM workspace_members WHERE user_id = $1 AND workspace_id = $2",
    [userId, workspaceId]
  );

  if (membership.rowCount === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await pool.query(
    "INSERT INTO collections (workspace_id, name) VALUES ($1, $2) RETURNING *",
    [workspaceId, name]
  );

  return NextResponse.json({ collection: result.rows[0] });
}
