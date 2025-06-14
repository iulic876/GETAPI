import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const API_AUTH_PATH = "/api/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const isApiAuth = pathname.startsWith(API_AUTH_PATH);
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isAuthenticated = !!token;

  // ⛔ Not authenticated, but trying to access protected routes
  if (!isAuthenticated && !isPublic && !isApiAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Authenticated, but trying to access /login or /register again
  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/collections", request.url)); // or /dashboard
  }

  return NextResponse.next();
}
