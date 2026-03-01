"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api/api-client";

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await api.getProducts();
      if (data.success) setProducts(data.products);
    }
    load();
  }, [category]);

  return (
    <div className="grid grid-cols-3 gap-6 p-10">
      {products.map((p: any) => (
        <a key={p.id} href={`/product/${p.slug}`}>
          <img src={p.product_image} />
          <h3>{p.name}</h3>
          <p>KES {p.base_price}</p>
        </a>
      ))}
    </div>
  );
}
