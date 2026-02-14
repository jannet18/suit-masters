"use client";

import { useState } from "react";
import { useCartStore } from "@/app/stores/cartStore";
import { Product } from "@/app/lib/types";
import CustomizationGroup from "@/app/product/CustomizationGroup";
import { CustomizationGroup as CustomizationGroupType } from "@/app/lib/types";
import { CustomOption } from "@/app/stores/cartStore";
import { toast } from "react-toastify";

export default function ProductDetails({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const { getTotal } = useCartStore();

  const handleAddToCart = () => {
    if (
      product.product_type === "CUSTOM" &&
      Object.keys(selectedOptions).length === 0
    ) {
      alert("Please select options first.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      quantity: 1,
      base_price: product.base_price?.toString(),
      image_url: product.product_image?.default,
      product_type: product.product_type,
      selected_options: Object.entries(selectedOptions)
        .map(([groupId, optionId]) => {
          const group = product.options?.find(
            (g) => g.id === Number(groupId),
          ) as
            | (CustomizationGroupType & { options: CustomOption[] })
            | undefined;
          const option = group?.options?.find((o) => o.id === optionId);
          return option ? option : null;
        })
        .filter((opt): opt is NonNullable<typeof opt> => opt !== null),
    });

    // alert("Added to cart!");
    toast.success("Added to cart successful ! 🎉");
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* IMAGE */}
      <div className="overflow-hidden rounded-xl">
        <img
          src={product.product_image?.default}
          alt={product.name}
          className="w-full object-cover"
        />
      </div>

      {/* DETAILS */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

        <p className="text-amber-600 text-xl font-semibold mb-4">
          USD {getTotal()}
        </p>

        {product.product_type === "CUSTOM" &&
          product.options?.map((group) => (
            <CustomizationGroup
              key={group.id}
              group={group}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
            />
          ))}

        <button
          onClick={handleAddToCart}
          className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
// "use client";

// import StandardProductView from "@/app/product/StandardProductView";

// interface Props {
//   product: any;
// }

// export default function ProductDetails({ product }: Props) {
//   if (product.is_customizable) {
//     return <CustomProductBuilder product={product} />;
//   }

//   return <StandardProductView product={product} />;
// }
