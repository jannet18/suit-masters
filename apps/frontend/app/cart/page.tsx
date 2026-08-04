// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Trash2 } from "lucide-react";
// import { useCartStore } from "../stores/useCartStore";

// export default function CartPage() {
//   const { cart, removeFromCart, updateQuantity,getTotal } = useCartStore();
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);
//   // Hydration fallback skeleton loader matching your premium custom tailoring palette
//   if (!hydrated) {
//     return (
//       <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
//         <div className="col-span-1 space-y-6 w-full">
//           {[1, 2].map((n) => (
//             <div key={n} className="flex gap-4 border border-[#2e2e2e] rounded-lg p-4 animate-pulse">
//               <div className="w-24 h-24 bg-[#2e2e2e] rounded-md" />
//               <div className="flex-1 space-y-3">
//                 <div className="h-4 bg-[#2e2e2e] rounded w-3/4" />
//                 <div className="h-3 bg-[#2e2e2e] rounded w-1/2" />
//                 <div className="h-4 bg-[#2e2e2e] rounded w-1/4 mt-3" />
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="col-span-1 border border-[#2e2e2e] rounded-lg p-6 h-fit animate-pulse w-full">
//           <div className="h-5 bg-[#2e2e2e] rounded w-1/2 mb-4 mx-auto" />
//           <div className="h-4 bg-[#2e2e2e] rounded w-full mb-2" />
//           <div className="h-4 bg-[#2e2e2e] rounded w-full mb-4" />
//           <div className="h-4 bg-[#2e2e2e] rounded w-3/4 mb-6" />
//           <div className="h-10 bg-[#2e2e2e] rounded w-full" />
//         </div>
//       </div>
//     );
//   }

//   if (cart.length === 0) {
//     return (
//       <div className="max-w-4xl min-h-screen mx-auto p-6 flex flex-col items-center justify-center bg-[#0f0f0f] text-[#f5f0eb]">
//         <h1 className="text-2xl font-serif font-semibold mb-4">Your cart is empty</h1>
//         <p className="text-[#9a9490] mb-6">Add some products to get started.</p>
//         <Link
//           href="/shop/suits"
//           className="px-6 py-3 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-colors"
//         >
//           Browse Suits
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-6 justify-items-center items-start bg-[#0f0f0f] text-[#f5f0eb] min-h-screen">
//       {/* CART ITEMS */}
//       <div className="col-span-3 space-y-6 max-w-4xl w-full">
//         {cart.map((item, idx) => (
//           <div
//             key={`${item.id}-${JSON.stringify(item.selectedOptions)}-${idx}`}
//             className="flex gap-4 border border-[#2e2e2e] rounded-lg p-4"
//           >
//             <div className="w-24 h-24 overflow-hidden rounded-md shrink-0">
//               <img
//                 src={item.imageUrl}
//                 alt={item.name}
//                 width={120}
//                 height={120}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                 // Fallback to placeholder if asset load fails
//                   (e.target as HTMLImageElement).src = "/images/placeholder.png";
//                 }}
//               />
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="font-medium text-[#f5f0eb] truncate">{item.name}</h3>
//               {item.selectedOptions && item.selectedOptions.length > 0 && (
//                 <div className="text-sm text-[#9a9490] mt-1">
//                   {item.selectedOptions.map((option, idx) => (
//                     <div key={idx}>
//                       {option.label} (+£{option.price_impact})
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="flex justify-between items-center mt-3">
//                 <span className="font-mono font-semibold text-[#f5f0eb]">
//                   £{((Number(item.basePrice) * item.quantity)).toFixed(2)}
//                 </span>

//                 <button
//                   onClick={() => removeFromCart(item.id, item.selectedOptions)}
//                   className="text-sm text-[#9a9490] hover:text-red-400 transition-colors"
//                 >
//                   <Trash2 className="w-4 h-4 cursor-pointer" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       {/* SUMMARY */}
//       {/* <div className="col-span-1 border rounded-l"> */}
//       <div className="col-span-2 border border-[#2e2e2e] rounded-lg p-6 h-fit w-full bg-[#1a1a1a]">
//         <h2 className="text-lg font-serif font-semibold mb-4 tracking-wider text-center">
//           Order Summary
//         </h2>
//         <div className="flex justify-between mb-2">
//           <span className="text-[#9a9490]">Subtotal</span>
//           <span className="font-mono">£{getTotal().toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between gap-3 mb-4">
//           <span className="text-[#9a9490]">Shipping</span>
//           <span className="text-[#9a9490]">Calculated at checkout</span>
//         </div>

//         <hr className="mb-4 border-[#2e2e2e]" />

//         <div className="flex justify-between font-semibold mb-6">
//           <span className="font-bold text-[#f5f0eb]">Total</span>
//           <span className="font-mono font-bold text-[#c9a96e]">£{getTotal().toFixed(2)}</span>
//         </div>

//         <Link href="/checkout">
//           <button className="w-full bg-[#c9a96e] text-black py-3 rounded-lg font-medium hover:bg-[#d8b87c] transition-colors cursor-pointer">
//             Proceed to Checkout
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Hydration fallback skeleton loader matching your premium custom tailoring palette
  if (!hydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6 w-full">
          {[1, 2].map((n) => (
            <div key={n} className="flex gap-6 border border-[#2e2e2e] bg-[#161616] rounded-xl p-5 animate-pulse">
              <div className="w-24 h-24 bg-[#2e2e2e] rounded-md shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-[#2e2e2e] rounded w-3/4" />
                <div className="h-3 bg-[#2e2e2e] rounded w-1/2" />
                <div className="h-5 bg-[#2e2e2e] rounded w-1/4 mt-4" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 border border-[#2e2e2e] bg-[#161616] rounded-xl p-6 h-fit animate-pulse w-full">
          <div className="h-5 bg-[#2e2e2e] rounded w-1/2 mb-6" />
          <div className="space-y-4">
            <div className="h-4 bg-[#2e2e2e] rounded w-full" />
            <div className="h-4 bg-[#2e2e2e] rounded w-full" />
            <div className="h-1 bg-[#2e2e2e] rounded w-full my-2" />
            <div className="h-6 bg-[#2e2e2e] rounded w-1/2" />
            <div className="h-12 bg-[#2e2e2e] rounded w-full pt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 border border-[#2e2e2e]">
          <ShoppingBag className="w-8 h-8 text-[#c9a96e]" />
        </div>
        <h1 className="text-3xl font-serif font-semibold mb-4 text-[#f5f0eb]">Your cart is empty</h1>
        <p className="text-[#9a9490] max-w-md mb-8 leading-relaxed">
          Design your custom suits, shirts, and blazers with Vitale Barberis Canonico fabrics and premium options.
        </p>
        <Link
          href="/shop/suits"
          className="px-8 py-3 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Browse Suits Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-[#f5f0eb] mb-8 tracking-wide">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CART ITEMS CONTAINER */}
        <div className="lg:col-span-8 space-y-6 w-full">
          {cart.map((item, idx) => (
            <div
              key={`${item.id}-${JSON.stringify(item.selectedOptions)}-${idx}`}
              className="flex flex-col sm:flex-row gap-6 border border-[#2e2e2e] bg-[#161616] rounded-xl p-5 transition-all hover:border-[#3e3e3e]"
            >
              <div className="w-full sm:w-28 h-32 overflow-hidden rounded-lg shrink-0 border border-[#2e2e2e]">
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1594938374181-4b7d72c4370c?w=400"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if asset load fails
                    e.currentTarget.src = "https://images.unsplash.com/photo-1594938374181-4b7d72c4370c?w=400";
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-serif text-lg font-medium text-[#f5f0eb] truncate">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.id, Array.isArray(item.selectedOptions) ? item.selectedOptions : [])}
                      className="text-[#9a9490] hover:text-red-400 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-5 h-5 cursor-pointer" />
                    </button>
                  </div>
                  
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#9a9490] mt-2 border-t border-[#2e2e2e] pt-2">
                      {item.selectedOptions.map((option: { label?: string; price_impact?: number | string }, oIdx: number) => (
                        <div key={oIdx} className="flex justify-between py-0.5">
                          <span>{option.label}</span>
                          <span className="text-[#c9a96e] font-mono">
                            {Number(option.price_impact) > 0 ? `+£${Number(option.price_impact).toFixed(2)}` : "Included"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#2e2e2e]/50">
                  {/* Premium Increment/Decrement Adjuster */}
                  <div className="flex items-center gap-3 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="p-1 hover:text-[#c9a96e] disabled:opacity-30 disabled:hover:text-[#9a9490] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-mono text-sm text-[#f5f0eb]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:text-[#c9a96e] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-mono font-semibold text-lg text-[#f5f0eb]">
                    £{((Number(item.basePrice || 0) + (item.selectedOptions?.reduce((sum: number, o: { price_impact?: number | string }) => sum + Number(o.price_impact || 0), 0) || 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:col-span-4 border border-[#2e2e2e] bg-[#161616] rounded-xl p-6 w-full sticky top-24">
          <h2 className="text-xl font-serif font-semibold mb-6 tracking-wide text-[#f5f0eb]">
            Order Summary
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#9a9490]">Subtotal</span>
              <span className="font-mono text-[#f5f0eb]">£{getTotal().toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-[#9a9490]">Shipping</span>
              <span className="text-xs text-[#9a9490] italic">Calculated at checkout</span>
            </div>

            <hr className="border-[#2e2e2e] my-4" />

            <div className="flex justify-between items-baseline font-semibold">
              <span className="text-[#f5f0eb] font-serif">Estimated Total</span>
              <span className="font-mono text-2xl text-[#c9a96e]">£{getTotal().toFixed(2)}</span>
            </div>

            <div className="pt-6">
              <Link href="/checkout" className="block w-full">
                <button className="w-full bg-[#c9a96e] text-black py-4 rounded-lg font-medium hover:bg-[#d8b87c] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
            
            <p className="text-[10px] text-center text-[#9a9490] mt-4 leading-relaxed">
              Tailoring takes approximately 14 days from measurement confirmation. Free standard shipping applies on all premium packages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}