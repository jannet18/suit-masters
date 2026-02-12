import { Product } from "../types";

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`http://localhost:4000/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`http://localhost:4000/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}
