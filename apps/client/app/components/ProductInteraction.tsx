"use client";

import { useRouter } from "next/router";
import { Product } from "../lib/types";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import useCartStore from "../stores/cartStore";

const ProductInteraction = ({
  product,
  selectedColor,
  selectedSize,
}: {
  product: Product;
  selectedColor: string;
  selectedSize: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();

  const handleTypeChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`${pathname}?${params.toString()}&scroll=false`);
  };

  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity,
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* SIZE */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Size:</span>
        <div className="flex gap-2">
          {product.sizes.map((size) => (
            <div
              className={`cursor-pointer border-box ${selectedSize === size ? "border-gray-600" : "border-gray-300"}`}
              key={size}
              onClick={() => handleTypeChange("size", size)}
            >
              <button
                key={size}
                className={`px-3 py-1 w-6 h-6 border rounded-md ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : "border-gray-300"
                }`}
              >
                {size.toLocaleUpperCase()}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* COLOR */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Color:</span>
        <div className="flex gap-2">
          {product.colors.map((color) => (
            <div
              className={`cursor-pointer border-box ${selectedColor === color ? "border-gray-600" : "border-gray-300"}`}
            >
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? "border-gray-300" : "border-white"
                }`}
                style={{ backgroundColor: color }}
              ></button>
            </div>
          ))}
        </div>
      </div>
      {/* Quantity */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Quantity:</span>
        <div className="flex items-center border rounded-md">
          <button
            onClick={() => handleQuantityChange("decrement")}
            className="px-3 py-1 border-r"
          >
            -
          </button>
          <span className="px-3 py-1">{quantity}</span>
          <button
            onClick={() => handleQuantityChange("increment")}
            className="px-3 py-1 border-l"
          >
            +
          </button>
        </div>
      </div>
      {/* BUTTONS */}
      <button
        onClick={handleAddToCart}
        className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add to Cart
      </button>
      <button className="ring-1 ring-gray-400 shadow-lg text-gray-800 px-4 py-2 rounded-md flex items-center justify-center cursor-pointer gap-2 text-sm font-medium">
        <ShoppingCart className="w-4 h-4" />
        Buy this Item
      </button>
    </div>
  );
};

export default ProductInteraction;
