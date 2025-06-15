import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { requestId } = params;

  try {
    const result = await pool.query(
      `SELECT r.*
       FROM requests r
       JOIN collections c ON c.id = r.collection_id
       JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
       WHERE r.id = $1 AND wm.user_id = $2`,
      [requestId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: result.rows[0] });
  } catch (err) {
    console.error("GET /api/requests/[requestId] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { requestId } = params;
  const { name, method, url, collectionId } = await req.json();

  try {
    const result = await pool.query(
      `UPDATE requests r
       SET name = COALESCE($1, r.name),
           method = COALESCE($2, r.method),
           url = COALESCE($3, r.url),
           collection_id = COALESCE($4, r.collection_id)
       FROM collections c
       JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
       WHERE r.id = $5
       AND r.collection_id = c.id
       AND wm.user_id = $6
       RETURNING r.*`,
      [name, method, url, collectionId, requestId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Request not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: result.rows[0] });
  } catch (err) {
    console.error("PUT /api/requests/[requestId] error:", err);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = verifyToken(token);
  const { requestId } = params;

  try {
    const result = await pool.query(
      `DELETE FROM requests r
       USING collections c, workspace_members wm
       WHERE r.id = $1
       AND r.collection_id = c.id
       AND c.workspace_id = wm.workspace_id
       AND wm.user_id = $2
       RETURNING r.*`,
      [requestId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Request not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: result.rows[0] });
  } catch (err) {
    console.error("DELETE /api/requests/[requestId] error:", err);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
