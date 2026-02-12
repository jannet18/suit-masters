const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return res.json();
  } catch (error) {
    console.error("Product fetch error:", error);
    return [];
  }
}
