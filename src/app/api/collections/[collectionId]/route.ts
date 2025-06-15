import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// Get or delete a collection by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { collectionId } = params;

  try {
    const collectionRes = await pool.query(
      `SELECT c.* FROM collections c
       JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
       WHERE c.id = $1 AND wm.user_id = $2`,
      [collectionId, userId]
    );

    if (collectionRes.rowCount === 0) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const requestsRes = await pool.query(
      `SELECT * FROM requests WHERE collection_id = $1 ORDER BY created_at DESC`,
      [collectionId]
    );

    return NextResponse.json({
      collection: collectionRes.rows[0],
      requests: requestsRes.rows,
    });
  } catch (err) {
    console.error("GET /api/collections/[collectionId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { collectionId } = params;

  try {
    const result = await pool.query(
      `DELETE FROM collections c
       USING workspace_members wm
       WHERE c.id = $1
       AND c.workspace_id = wm.workspace_id
       AND wm.user_id = $2
       RETURNING c.*`,
      [collectionId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Collection not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection: result.rows[0] });
  } catch (err) {
    console.error("DELETE /api/collections/[collectionId] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete collection" },
      { status: 500 }
    );
  }
}
