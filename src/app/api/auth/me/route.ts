import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";


export async function GET(req: NextRequest){
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const payload = verifyToken(token); // { userId: ... }

      const result = await pool.query(
        "SELECT id, email, name FROM users WHERE id = $1",
        [payload.userId]
      );

      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Fetch workspaces for the user
      const workspacesResult = await pool.query(
        `SELECT w.* FROM workspaces w
         JOIN workspace_members wm ON wm.workspace_id = w.id
         WHERE wm.user_id = $1`,
        [payload.userId]
      );
      const workspaces = workspacesResult.rows;

      // Fetch collections for these workspaces
      const workspaceIds = workspaces.map(w => w.id);
      let collections = [];
      if (workspaceIds.length > 0) {
        const collectionsResult = await pool.query(
          `SELECT * FROM collections WHERE workspace_id = ANY($1::uuid[])`,
          [workspaceIds]
        );
        collections = collectionsResult.rows;
      }

      // Fetch requests for these collections
      const collectionIds = collections.map(c => c.id);
      let requests = [];
      if (collectionIds.length > 0) {
        const requestsResult = await pool.query(
          `SELECT * FROM requests WHERE collection_id = ANY($1::uuid[])`,
          [collectionIds]
        );
        requests = requestsResult.rows;
      }

      return NextResponse.json({ user, workspaces, collections, requests });
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
}