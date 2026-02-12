const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error occurred: ${res.statusText}`);
  }

  return res.json();
}
