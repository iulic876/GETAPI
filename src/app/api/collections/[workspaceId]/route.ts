import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// Get all collections for a workspace
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { workspaceId } = params;

  try {
    // Verify membership and get collections in one query
    const result = await pool.query(
      `SELECT c.* 
       FROM collections c
       JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
       WHERE c.workspace_id = $1 AND wm.user_id = $2
       ORDER BY c.created_at DESC`,
      [workspaceId, userId]
    );

    return NextResponse.json({ collections: result.rows });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// Create a new collection in a workspace
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { workspaceId } = params;
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Collection name is required" },
      { status: 400 }
    );
  }

  try {
    // Verify membership first
  const membership = await pool.query(
    "SELECT * FROM workspace_members WHERE user_id = $1 AND workspace_id = $2",
    [userId, workspaceId]
  );

  if (membership.rowCount === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

    // Create the collection
  const result = await pool.query(
      "INSERT INTO collections (workspace_id, name) VALUES ($1, $2) RETURNING *",
      [workspaceId, name]
  );

    return NextResponse.json({ collection: result.rows[0] });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
