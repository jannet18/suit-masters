"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/api-client";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const searchParams = useSearchParams(); //to access ?query
  const query = searchParams.get("query"); //get specific value
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.getProducts({
        category: category,
        search: query || "",
      });

      if (data.success) setProducts(data.products);
      setLoading(false);
    }
    load();
  }, [category, query]);

  return (
    <div className="p-10">
      {query && (
        <h2 className="mb-6 text-xl">
          Results for <span className="font-bold">{query}</span>
        </h2>
      )}
      {products.length === 0 ? (
        <div className="h-40 flex items-center justify-center border border-dashed">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Array.isArray(products) ? products : []).map((p: any) => (
            <a key={p.id} href={`/product/${p.slug}`} className="group">
              <div className="aspect-square overflow-hidden bg-gray-100 mb-2">
                <img
                  src={p.product_image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-white">{p.name}</h3>
              <p className="text-[#c9a96e]">£{p.base_price}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
