"use client";

import { Product } from "../lib/types";

const ProductInteraction = ({
  product,
  selectedColor,
  selectedSize,
}: {
  product: Product;
  selectedColor: string;
  selectedSize: string;
}) => {
  return (
    <div className="flex flex-col gap-4 mt-4 ">
      {/* SIZE */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Size:</span>
        <div className="flex gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              className={`px-3 py-1 border rounded-md ${
                selectedSize === size
                  ? "bg-black text-white"
                  : "border-gray-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductInteraction;
