import { headers } from "next/headers";

export async function getServerSession() {
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
