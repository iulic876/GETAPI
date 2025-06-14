import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    expires: new Date(0), // expires immediately
  });

  return res;
}
