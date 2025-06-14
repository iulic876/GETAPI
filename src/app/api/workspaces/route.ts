import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);

  try {
    // Get all workspaces for the user
    const result = await pool.query(
      `SELECT w.id, w.name, w.created_at
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return NextResponse.json({ workspaces: result.rows });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Workspace name required" },
      { status: 400 }
    );
  }

  try {
    const workspace = await pool.query(
      "INSERT INTO workspaces (name) VALUES ($1) RETURNING id, name, created_at",
      [name]
    );

    const created = workspace.rows[0];

    // Assign current user as owner
    await pool.query(
      "INSERT INTO workspace_members (user_id, workspace_id, role) VALUES ($1, $2, $3)",
      [userId, created.id, "owner"]
    );

    return NextResponse.json({ workspace: created });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
