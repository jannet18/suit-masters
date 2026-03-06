"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/api-client";
import { useRouter } from "next/navigation";

interface ProductPageProps {
  params: { id: number };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = params;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const productResponse = await api.getProductById(id);

        if (productResponse.success && productResponse.product) {
          setProduct(productResponse.product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#f5f0eb] font-serif">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center flex-col gap-6">
        <h1 className="font-serif text-3xl text-[#f5f0eb]">
          Product Not Found
        </h1>
        <button
          onClick={() => router.push("/")}
          className="text-[#c9a96e] hover:text-[#dfc08a] text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb]">
      <header className="p-6 border-b border-[#2e2e2e]">
        <button onClick={() => router.push("/")} className="text-[#c9a96e]">
          ← Back to Home
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <img
              src={
                product?.product_image?.default ||
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80&auto=format&fit=crop"
              }
              alt={product?.name}
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div>
            <h1 className="text-4xl font-serif font-bold mb-4">
              {product?.name}
            </h1>
            <p className="text-2xl text-[#c9a96e] mb-6">
              £{product?.base_price || 0}
            </p>
            <p className="text-[#9a9490] mb-8">
              {product?.description || "No description available."}
            </p>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Product Type</h3>
              <p className="text-[#9a9490]">
                {product.product_type || "Standard"}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">
                Customization Options
              </h3>
              {product.customizationGroups?.length > 0 ? (
                <ul className="space-y-2">
                  {product?.customizationGroups.map((group: any) => (
                    <li key={group.id} className="text-[#9a9490]">
                      {group.name} ({group.options?.length || 0} options)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#9a9490]">
                  No customization options available.
                </p>
              )}
            </div>

            <button
              onClick={() => alert("Added to cart!")}
              className="bg-[#c9a96e] text-[#0f0f0f] px-8 py-3 font-bold hover:bg-[#dfc08a] transition-colors w-full"
            >
              Add to Cart
            </button>

            <button
              onClick={() => router.push(`/products/${product.slug}`)}
              className="mt-4 border border-[#c9a96e] text-[#c9a96e] px-8 py-3 font-bold hover:bg-[#c9a96e] hover:text-[#0f0f0f] transition-colors w-full"
            >
              Customize This Product
            </button>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold mb-6">
            Product Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Category</h3>
              <p className="text-[#9a9490]">
                ID: {product.category_id || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Fabric</h3>
              <p className="text-[#9a9490]">
                ID: {product?.fabric_id || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Status</h3>
              <p className="text-[#9a9490]">
                {product?.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Slug</h3>
              <p className="text-[#9a9490]">{product?.slug}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
