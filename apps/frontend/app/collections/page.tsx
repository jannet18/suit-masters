"use client";

import Link from "next/link";
import { useCartStore } from "@/app/stores/useCartStore";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

interface CollectionProps {
  product: {
    id: number;
    slug: string;
    name: string;
    base_price: number;
    product_image: string | { default: string };
    product_type?: "STANDARD" | "CUSTOM";
    tag?: string;
    colors?: string;
    hoverImage?: string;
  };
  id?: number;
}

export function Page({ product, id }: CollectionProps) {
  // Handle both string and object formats for product_image
  const imageUrl =
    typeof product.product_image === "string"
      ? product.product_image
      : product.product_image?.default ||
        "https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=600&q=80&fit=crop";

  const productName = product.name || "Bespoke Suit";
  const price = product.base_price || 0;
  const slug = product.slug || "";
  const productType = product.product_type || "CUSTOM";

  const { addToCart, cart } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      productId: product.id.toString(),
      name: productName,
      base_price: price,
      totalPrice: price,
      quantity: 1,
      product_type: "STANDARD" as const,
      image_url: imageUrl,
      configuration: {}, // Empty configuration for standard products
      selected_options: [],
      measurements: {},
      customizations: {},
    };

    addToCart(cartItem);
    setIsAdded(true);

    // Reset the added state after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isInCart = cart.some(
    (item) => item.id === product.id && item.product_type === "STANDARD",
  );

  return (
    <div className="group relative overflow-hidden rounded-md w-full">
      {/* Product Image */}
      <div className="aspect-3/4 overflow-hidden bg-[#151515]">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-md"
        />
      </div>

      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
        {productType === "CUSTOM" ? (
          <Link
            href={`/products/${slug}/configure`}
            className="bg-[#c9a96e] text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Customise This Suit
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isInCart || isAdded}
            className={`flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-[#c9a96e] ${
              isInCart || isAdded
                ? "bg-green-600 text-white"
                : "bg-[#c9a96e] text-black hover:bg-white"
            }`}
          >
            {isInCart || isAdded ? (
              <>
                <Check size={12} />
                {isInCart ? "In Cart" : "Added!"}
              </>
            ) : (
              <>
                <ShoppingBag size={12} />
                Add to Cart
              </>
            )}
          </button>
        )}
        <Link
          href={`/products/${slug}`}
          className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/20"
        >
          View Details
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
          {productType === "STANDARD" ? "Ready to Wear" : "Bespoke Tailoring"}
        </p>
      </div>
    </div>
  );
}
// apps/frontend/components/products/ProductCard.tsx
// "use client";

// import Link from "next/link";
// import { ShoppingBag, Check, Settings2 } from "lucide-react";
// import { useState } from "react";
// import { useCartStore } from "@/app/stores/useCartStore";

// export function ProductCard({ product }: { product: any }) {
//   const [isAdded, setIsAdded] = useState(false);
//   const { addToCart, cart } = useCartStore();

//   // 1. Defensively handle image URLs - check multiple possible fields
//   const imageUrl =
//     product.product_image ||
//     product.image_url ||
//     (typeof product.product_image === "string"
//       ? product.product_image
//       : product.product_image?.default) ||
//     "/placeholder-suit.jpg";

//   const isCustom = product.product_type === "CUSTOM";
//   const isInCart = cart.some((item) => item.id === product.id);

//   const handleQuickAdd = (e: React.MouseEvent) => {
//     e.preventDefault(); // Prevent navigating to details
//     addToCart({
//       ...product,
//       quantity: 1,
//       image_url: imageUrl,
//     });
//     setIsAdded(true);
//     setTimeout(() => setIsAdded(false), 2000);
//   };

//   return (
//     <div className="group relative bg-[#151515] rounded-sm overflow-hidden border border-white/5">
//       {/* Image Container */}
//       <div className="aspect-3/4 overflow-hidden relative">
//         <img
//           src={imageUrl}
//           alt={product.name}
//           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//         />

//         {/* Hover Overlay */}
//         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
//           {isCustom ? (
//             <Link
//               href={`/products/${product.slug}/configure`}
//               className="w-full bg-[#c9a96e] text-black py-3 text-[10px] font-bold uppercase tracking-widest text-center hover:bg-white transition-colors flex items-center justify-center gap-2"
//             >
//               <Settings2 size={14} /> Design Your Suit
//             </Link>
//           ) : (
//             <button
//               onClick={handleQuickAdd}
//               className="w-full bg-[#c9a96e] text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
//             >
//               {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
//               {isAdded ? "Added" : "Quick Add"}
//             </button>
//           )}
//           <Link
//             href={`/products/${product.slug}`}
//             className="w-full bg-white/10 backdrop-blur-sm text-white py-3 text-[10px] font-bold uppercase tracking-widest text-center hover:bg-white/20 border border-white/20"
//           >
//             Product Details
//           </Link>
//         </div>
//       </div>

//       {/* Info Section */}
//       <div className="p-5">
//         <div className="flex justify-between items-start mb-1">
//           <h4 className="font-serif text-[#f5f0eb] group-hover:text-[#c9a96e] transition-colors">
//             {product.name}
//           </h4>
//           <span className="text-[#c9a96e] text-sm font-light">
//             £{product.base_price}
//           </span>
//         </div>
//         <p className="text-[#9a9490] text-[9px] uppercase tracking-[0.2em]">
//           {isCustom ? "Bespoke Tailoring" : "Ready to Wear"}
//         </p>
//       </div>
//     </div>
//   );
// }
