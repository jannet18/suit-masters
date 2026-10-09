import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@repo/auth";

// Node.js runtime is required here (not the default Edge runtime) so we can
// call Better Auth's `auth.api.getSession`, which needs a real DB connection.
export const runtime = "nodejs";

const publicRoutes = ["/login", "/register", "/api/auth", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.roles !== "ADMIN") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
