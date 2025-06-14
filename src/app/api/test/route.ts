import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return handleMock(req);
}

export async function POST(req: NextRequest) {
  return handleMock(req);
}

export async function PUT(req: NextRequest) {
  return handleMock(req);
}

export async function DELETE(req: NextRequest) {
  return handleMock(req);
}

// Reusable mock handler
async function handleMock(req: NextRequest) {
  const body = req.body ? await req.text() : null;
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());

  return NextResponse.json({
    method: req.method,
    query,
    headers: Object.fromEntries(req.headers.entries()),
    body,
    timestamp: new Date().toISOString(),
  });
}
