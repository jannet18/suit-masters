import { headers } from "next/headers";
import type { authClient } from "./auth-client";

type Session = typeof authClient.$Infer.Session;

/**
 * auth.handler lives in the separate auth-service, not in this Next.js app,
 * so server components fetch the session over HTTP rather than importing
 * a local better-auth instance, forwarding the incoming request's cookies.
 */
export async function getServerSession(): Promise<Session | null> {
  const AUTH_URL =
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:4004";
  const incomingHeaders = await headers();

  const res = await fetch(`${AUTH_URL}/api/auth/get-session`, {
    headers: {
      cookie: incomingHeaders.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data ?? null;
}
