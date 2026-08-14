import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/_next/static", "/favicon.ico"];

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:4004";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const sessionRes = await fetch(`${AUTH_SERVICE_URL}/api/auth/get-session`, {
    headers: { cookie: request.headers.get("cookie") || "" },
  });
  const session = sessionRes.ok ? await sessionRes.json() : null;

  if (!session) {
    const loginUrl = new URL(
      process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
    );
    loginUrl.pathname = "/login";
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
