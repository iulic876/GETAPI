import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// Get a single collection
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; collectionId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { workspaceId, collectionId } = params;

  try {
    // Get collection and verify membership in one query
    const result = await pool.query(
      `SELECT c.* 
       FROM collections c
       JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
       WHERE c.id = $1 AND c.workspace_id = $2 AND wm.user_id = $3`,
      [collectionId, workspaceId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ collection: result.rows[0] });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

// Update a collection
export async function PUT(
  req: NextRequest,
  { params }: { params: { workspaceId: string; collectionId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { workspaceId, collectionId } = params;
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Collection name is required" },
      { status: 400 }
    );
  }

  try {
    // Update collection and verify membership in one query
    const result = await pool.query(
      `UPDATE collections c
       SET name = $1
       FROM workspace_members wm
       WHERE c.id = $2 
       AND c.workspace_id = $3 
       AND c.workspace_id = wm.workspace_id 
       AND wm.user_id = $4
       RETURNING c.*`,
      [name, collectionId, workspaceId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Collection not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection: result.rows[0] });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

// Delete a collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; collectionId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { workspaceId, collectionId } = params;

  try {
    // Delete collection and verify membership in one query
    const result = await pool.query(
      `DELETE FROM collections c
       USING workspace_members wm
       WHERE c.id = $1 
       AND c.workspace_id = $2 
       AND c.workspace_id = wm.workspace_id 
       AND wm.user_id = $3
       RETURNING c.*`,
      [collectionId, workspaceId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Collection not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection: result.rows[0] });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
} 