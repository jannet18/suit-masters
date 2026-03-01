"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api/api-client";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  product_image: string;
  base_price: string;
  product_type: string;
}

export default function CollectionPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    if (!slug) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.getProductsInCollection(slug);
        if (res.success) {
          setProducts(res.products);
        } else {
          setError(res.error || "Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  if (loading) return <p className="text-center py-24">Loading products...</p>;
  if (error) return <p className="text-center py-24 text-red-500">{error}</p>;
  if (!products || products.length === 0)
    return (
      <p className="text-center py-24">No products found in this collection.</p>
    );

  return (
    <section className="py-24 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <h1 className="text-4xl md:text-5xl font-serif text-[#f5f0eb] font-bold mb-12">
          {slug?.replace(/-/g, " ")} Collection
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <div
              key={p.id}
              onClick={() => router.push(`/products/${p.product.slug}`)}
              className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow group cursor-pointer"
            >
              <img
                src={p.product_image}
                alt={p.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4">
                <h2 className="text-[#f5f0eb] font-semibold text-lg">
                  {p.name}
                </h2>
                <p className="text-[#c9a96e] mt-1">USD {p.base_price}</p>
                <div className="flex items-center gap-2 mt-2 text-[#c9a96e] text-xs uppercase">
                  <span>View</span>
                  <ArrowRightIcon
                    size={12}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
