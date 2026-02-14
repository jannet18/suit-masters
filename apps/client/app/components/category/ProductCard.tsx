"use client";
import { Product } from "@/app/lib/types";
import Link from "next/link";
import { useCartStore, CustomOption } from "@/app/stores/cartStore";
import { useState } from "react";
import CustomizationGroup from "@/app/components/customization/CustomizationGroup";
import { toast } from "react-toastify";

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state: any) => state.addToCart);
  const { getTotal } = useCartStore();
  const [selectedOptions, setSelectedOptions] = useState<CustomOption[]>([]);

  const handleAddToCart = () => {
    if (product.product_type === "CUSTOM" && selectedOptions.length === 0) {
      toast("Please select options!");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      quantity: 1,
      base_price: Number(product.base_price?.toString()),
      image_url: product.product_image?.default,
      product_type: product.product_type,
      selected_options: selectedOptions.length ? selectedOptions : undefined,
    });

    // console.log("Added to cart!");
    toast("Added to cart successfully!");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-3">
      <Link href={`/product/${product.id}`} className="">
        <div className="relative overflow-hidden rounded-lg group">
          <img
            src={
              product.product_image?.default ||
              "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmxhY2slMjBzdWl0fGVufDB8fDB8fHww "
            }
            alt={product.name}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <h3 className="text-sm font-medium text-gray-800 mt-2 line-clamp-1">
          {product.name}
        </h3>
      </Link>
      <p className="text-amber-600 font-semibold mt-1">USD {getTotal()}</p>
      {/* Show customization options */}
      {product.product_type === "CUSTOM" &&
        product.options?.map((group) => (
          <CustomizationGroup
            key={group.id}
            // group={group} --- IGNORE ---
            group={group as any} // TODO: fix types
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
        ))}

      <button
        onClick={handleAddToCart}
        className="mt-3 w-full bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-black transition"
      >
        Add to Cart
      </button>
    </div>
  );
}
