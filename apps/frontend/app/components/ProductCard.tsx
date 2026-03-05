"use client";

import Link from "next/link";

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    name: string;
    base_price: number;
    product_image: string;
    product_type?: "STANDARD" | "CUSTOM";
  };
  index?: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const imageUrl =
    product.product_image ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=600&q=80&fit=crop";

  const productName = product.name || "Bespoke Suit";
  const price = product.base_price || 0;
  const slug = product.slug || "";

  return (
    <div className="group relative overflow-hidden">
      {/* Product Image */}
      <div className="aspect-3/4 overflow-hidden bg-[#151515]">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Link
          href={`/products/${slug}/configure`}
          className="bg-[#c9a96e] text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors"
        >
          Customise This Suit
        </Link>
      </div>

      {/* Price Tag */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10">
        <p className="text-[#c9a96e] text-[10px] font-mono">From £{price}</p>
      </div>

      {/* Product Info */}
      <div className="mt-6 space-y-1">
        <h4 className="font-serif text-lg text-[#f5f0eb] group-hover:text-[#c9a96e] transition-colors">
          {productName}
        </h4>
        <p className="text-[#9a9490] text-[10px] uppercase tracking-widest font-light">
          Bespoke Tailoring
        </p>
      </div>
    </div>
  );
}
