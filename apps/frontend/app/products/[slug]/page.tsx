"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/api-client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";
import { ShoppingBag, Check } from "lucide-react";

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, cart } = useCartStore();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        console.log("Fetching product with slug:", slug);
        const productResponse = await api.getProductBySlug(slug);
        console.log("Product API response:", productResponse);

        if (productResponse.success && productResponse.product) {
          setProduct(productResponse.product);
          console.log("Product data set:", productResponse.product);
        } else {
          console.log("Product not found or API error:", productResponse);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    // Handle both string and object formats for product_image
    const imageUrl =
      typeof product.product_image === "string"
        ? product.product_image
        : product.product_image?.default ||
          "https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=600&q=80&fit=crop";

    const cartItem = {
      id: product.id,
      productId: product.id.toString(),
      name: product.name,
      base_price: product.base_price,
      totalPrice: product.base_price,
      quantity: 1,
      product_type: product.product_type || "STANDARD",
      image_url: imageUrl,
      configuration: {},
      selected_options: [],
      measurements: {},
      customizations: {},
    };

    addToCart(cartItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isInCart = cart.some(
    (item) =>
      item.id === product?.id &&
      item.product_type === (product?.product_type || "STANDARD"),
  );

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
                typeof product?.product_image === "string"
                  ? product.product_image
                  : product?.product_image?.default ||
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

            {product?.product_type === "CUSTOM" ? (
              <button
                onClick={() =>
                  router.push(`/products/${product.slug}/configure`)
                }
                className="bg-[#c9a96e] text-[#0f0f0f] px-8 py-3 font-bold hover:bg-[#dfc08a] transition-colors w-full flex items-center justify-center gap-2"
              >
                Start Customization
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isInCart || isAdded}
                className={`flex items-center justify-center gap-2 px-8 py-3 font-bold transition-colors w-full ${
                  isInCart || isAdded
                    ? "bg-green-600 text-white"
                    : "bg-[#c9a96e] text-[#0f0f0f] hover:bg-[#dfc08a]"
                }`}
              >
                {isInCart || isAdded ? (
                  <>
                    <Check size={16} />
                    {isInCart ? "In Cart" : "Added!"}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Add to Bag
                  </>
                )}
              </button>
            )}

            {product?.product_type === "STANDARD" && (
              <button
                onClick={() => router.push(`/collections`)}
                className="mt-4 border border-[#c9a96e] text-[#c9a96e] px-8 py-3 font-bold hover:bg-[#c9a96e] hover:text-[#0f0f0f] transition-colors w-full"
              >
                View Similar Products
              </button>
            )}
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
                {product?.category?.name ||
                  `ID: ${product?.category_id || "N/A"}`}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Fabric</h3>
              <p className="text-[#9a9490]">
                {product?.fabric?.name || `ID: ${product?.fabric_id || "N/A"}`}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Product Type</h3>
              <p className="text-[#9a9490]">
                {product?.product_type === "CUSTOM"
                  ? "Bespoke Tailoring"
                  : "Ready to Wear"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-[#9a9490]">
                {product?.description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
