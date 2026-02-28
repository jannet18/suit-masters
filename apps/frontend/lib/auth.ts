export async function getCurrentUser() {
  const res = await fetch("/api/me", {
    credentials: "include",
  });

  if (!res.ok) return null;
  return res.json();
}
