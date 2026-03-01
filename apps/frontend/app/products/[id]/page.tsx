"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/api-client";

export default function ProductPage({ params }: { params: { id: number } }) {
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await api.getProductById(params.id);
      if (res.success) setProduct(res.product);
    }
    load();
  }, [params.id]);

  if (!product) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-10">
      <h1 className="text-4xl mb-4">{product.name}</h1>
      <p className="mb-4">{product.description}</p>
      <p className="mb-6 text-xl">${product.basePrice}</p>

      <button
        onClick={() => router.push(`/products/${product.id}/configure`)}
        className="bg-white text-black px-6 py-3 rounded"
      >
        Customize This Suit
      </button>
    </div>
  );
}
