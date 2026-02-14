"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);

  try {
    useEffect(() => {
      fetch("http://localhost:4000/products")
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.all || []);
        })

        .catch(console.error);
    }, []);
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
