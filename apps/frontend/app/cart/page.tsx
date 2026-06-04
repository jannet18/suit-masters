"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

export default function CartPage() {
  const { cart, removeFromCart, getTotal } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
        <div className="col-span-1 space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="flex gap-4 border rounded-lg p-4 animate-pulse">
              <div className="w-24 h-24 bg-gray-200 rounded-md" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-3" />
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-1 border rounded-lg p-6 h-fit animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl min-h-screen mx-auto p-6 flex items-center justify-center">
        <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
        <p className="text-gray-500">Add some products to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
      {/* CART ITEMS */}
      <div className="col-span-1 space-y-6">
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
              {item.selected_options && item.selected_options.length > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  {item.selected_options.map((option, idx) => (
                    <div key={idx}>
                      {option.label} (+£ {option.price_impact})
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <span className="font-semibold">
                  £
                  {((Number(item.base_price) * item.quantity) / 100).toFixed(2)}
                </span>

                <button
                  onClick={() => removeFromCart(item.id, item.selected_options)}
                  className="text-sm text-red-500 hover:underline"
                >
                  <Trash2 className="w-4 h-5 cursor-pointer" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* SUMMARY */}
      <div className="col-span-1 border rounded-lg p-6 h-fit">
        <h2 className="text-lg font-semibold mb-4 tracking-wider text-center ">
          Order Summary
        </h2>
        <div className="flex justify-between mb-2">
          <span className="font-bold">Subtotal</span>
          <span>£ {getTotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-3 mb-4">
          <span className="font-bold text-md tracking-wider"> Shipping</span>
          <span className="text-md tracking-wider">Calculated at checkout</span>
        </div>

        <hr className="mb-4" />

        <div className="flex justify-between font-semibold mb-6">
          <span className="font-bold">Total</span>
          <span className="font-bold">£ {getTotal().toFixed(2)}</span>
        </div>

        <Link href="/checkout">
          <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition cursor-pointer">
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}
