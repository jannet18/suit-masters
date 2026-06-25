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
        <div className="col-span-1 space-y-6 w-full">
          {[1, 2].map((n) => (
            <div key={n} className="flex gap-4 border border-[#2e2e2e] rounded-lg p-4 animate-pulse">
              <div className="w-24 h-24 bg-[#2e2e2e] rounded-md" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-[#2e2e2e] rounded w-3/4" />
                <div className="h-3 bg-[#2e2e2e] rounded w-1/2" />
                <div className="h-4 bg-[#2e2e2e] rounded w-1/4 mt-3" />
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-1 border border-[#2e2e2e] rounded-lg p-6 h-fit animate-pulse w-full">
          <div className="h-5 bg-[#2e2e2e] rounded w-1/2 mb-4 mx-auto" />
          <div className="h-4 bg-[#2e2e2e] rounded w-full mb-2" />
          <div className="h-4 bg-[#2e2e2e] rounded w-full mb-4" />
          <div className="h-4 bg-[#2e2e2e] rounded w-3/4 mb-6" />
          <div className="h-10 bg-[#2e2e2e] rounded w-full" />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl min-h-screen mx-auto p-6 flex flex-col items-center justify-center bg-[#0f0f0f] text-[#f5f0eb]">
        <h1 className="text-2xl font-serif font-semibold mb-4">Your cart is empty</h1>
        <p className="text-[#9a9490] mb-6">Add some products to get started.</p>
        <Link
          href="/shop/suits"
          className="px-6 py-3 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-colors"
        >
          Browse Suits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-6 justify-items-center items-start bg-[#0f0f0f] text-[#f5f0eb] min-h-screen">
      {/* CART ITEMS */}
      <div className="col-span-3 space-y-6 max-w-4xl w-full">
        {cart.map((item, idx) => (
          <div
            key={`${item.id}-${JSON.stringify(item.selected_options)}-${idx}`}
            className="flex gap-4 border border-[#2e2e2e] rounded-lg p-4"
          >
            <div className="w-24 h-24 overflow-hidden rounded-md shrink-0">
              <img
                src={item.image_url}
                alt={item.name}
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[#f5f0eb] truncate">{item.name}</h3>
              {item.selected_options && item.selected_options.length > 0 && (
                <div className="text-sm text-[#9a9490] mt-1">
                  {item.selected_options.map((option, idx) => (
                    <div key={idx}>
                      {option.label} (+£{option.price_impact})
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <span className="font-mono font-semibold text-[#f5f0eb]">
                  £{((Number(item.base_price) * item.quantity)).toFixed(2)}
                </span>

                <button
                  onClick={() => removeFromCart(item.id, item.selected_options)}
                  className="text-sm text-[#9a9490] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* SUMMARY */}
      {/* <div className="col-span-1 border rounded-l"> */}
      <div className="col-span-2 border border-[#2e2e2e] rounded-lg p-6 h-fit w-full bg-[#1a1a1a]">
        <h2 className="text-lg font-serif font-semibold mb-4 tracking-wider text-center">
          Order Summary
        </h2>
        <div className="flex justify-between mb-2">
          <span className="text-[#9a9490]">Subtotal</span>
          <span className="font-mono">£{getTotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-3 mb-4">
          <span className="text-[#9a9490]">Shipping</span>
          <span className="text-[#9a9490]">Calculated at checkout</span>
        </div>

        <hr className="mb-4 border-[#2e2e2e]" />

        <div className="flex justify-between font-semibold mb-6">
          <span className="font-bold text-[#f5f0eb]">Total</span>
          <span className="font-mono font-bold text-[#c9a96e]">£{getTotal().toFixed(2)}</span>
        </div>

        <Link href="/checkout">
          <button className="w-full bg-[#c9a96e] text-black py-3 rounded-lg font-medium hover:bg-[#d8b87c] transition-colors cursor-pointer">
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}
