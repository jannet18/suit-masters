import { auth } from "@repo/auth";
import { headers } from "next/headers";

/**
 * Server-only helper: the current admin's session token, to forward as
 * `Authorization: Bearer <token>` when calling the backend services directly
 * from a server component (middleware.ts already guarantees this is an
 * authenticated ADMIN session by the time a page renders).
 */
export async function getSessionToken(): Promise<string | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.session.token;
}
