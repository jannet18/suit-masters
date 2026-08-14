import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/api/auth/login",
  "/api/auth/callback",
  "/api/auth/logout",
  "/_next/static",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for Kinde session cookie
  // Kinde sets a cookie like `kinde_<domain>_session` or uses `__session`
  const hasSession =
    request.cookies.has("__session") ||
    request.cookies.has("kinde_session") ||
    Array.from(request.cookies.getAll()).some((cookie) =>
      cookie.name.includes("kinde"),
    );

  // If no session, redirect to the frontend login page
  if (!hasSession) {
    const loginUrl = new URL(
      process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    );
    loginUrl.pathname = "/api/auth/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
