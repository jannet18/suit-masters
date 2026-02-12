"use client";

import Image from "next/image";
import { useCartStore } from "@/app/stores/cartStore";

export default function CartPage() {
  const { cart, removeFromCart, getTotal } = useCartStore();

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.base_price) * item.quantity,
    0,
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
        <p className="text-gray-500">Add some products to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-8">
      {/* CART ITEMS */}
      <div className="md:col-span-2 space-y-6">
        {cart.map((item, idx) => (
          <div
            key={`${item.id}-${JSON.stringify(item.selected_options)}-${idx}`}
            className="flex gap-4 border rounded-lg p-4"
          >
            <div className="w-24 h-24 overflow-hidden rounded-md">
              <Image
                src={item.image_url}
                alt={item.name}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              {/* 
              {item.selected_options && (
                <div className="text-sm text-gray-500 mt-1">
                  {Object.entries(item.selected_options).map(
                    ([groupId, optionId]) => (
                      <div key={groupId}>
                        Option {groupId}:{" "}
                        {typeof optionId === "object" &&
                        optionId !== null &&
                        "name" in optionId
                          ? String((optionId as { name: string }).name)
                          : String(optionId)}
                      </div>
                    ),
                  )}
                </div>
              )} */}

              {item.selected_options && item.selected_options.length > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  {item.selected_options.map((option, idx) => (
                    <div key={idx}>
                      {option.label} (+KES {option.price_impact})
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <span className="font-semibold">
                  KES {(Number(item.base_price) * item.quantity).toFixed(2)}
                </span>

                <button
                  onClick={() => removeFromCart(item.id, item.selected_options)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="border rounded-lg p-6 h-fit">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>KES {getTotal()}</span>
        </div>

        <div className="flex justify-between mb-4">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>

        <hr className="mb-4" />

        <div className="flex justify-between font-semibold mb-6">
          <span>Total</span>
          <span>KES {getTotal()}</span>
        </div>

        <button
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition"
          onClick={() => alert("Next step: login / checkout")}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
