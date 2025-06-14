import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query("SELECT * FROM collections");
  return NextResponse.json(result.rows);
}


export async function POST(req: NextRequest) {
  try {
    const { method, url, body } = await req.json();

    // Basic validation
    if (!method || !url) {
      return NextResponse.json(
        { error: "Method and URL are required." },
        { status: 400 }
      );
    }

    // Forward the request using native fetch
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
        ? body
        : undefined,
    });

    const contentType = res.headers.get("content-type") || "";

    // Try to parse JSON, otherwise return as text
    const responseData = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    return NextResponse.json({
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body: responseData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Request failed." },
      { status: 500 }
    );
  }
}
