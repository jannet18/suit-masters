const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}
