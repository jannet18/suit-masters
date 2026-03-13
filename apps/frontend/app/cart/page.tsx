// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { Trash2 } from "lucide-react";
// import { useCartStore } from "../stores/useCartStore";

// export default function CartPage() {
//   const { cart, removeFromCart, getTotal } = useCartStore();

//   if (cart.length === 0) {
//     return (
//       <div className="max-w-4xl min-h-screen mx-auto p-6 flex items-center justify-center">
//         <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
//         <p className="text-gray-500">Add some products to get started.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
//       {/* CART ITEMS */}
//       <div className="col-span-1 space-y-6">
//         {cart.map((item, idx) => (
//           <div
//             key={`${item.id}-${JSON.stringify(item.selected_options)}-${idx}`}
//             className="flex gap-4 border rounded-lg p-4"
//           >
//             <div className="w-24 h-24 overflow-hidden rounded-md">
//               <Image
//                 src={item.image_url}
//                 alt={item.name}
//                 width={96}
//                 height={96}
//                 className="object-cover"
//               />
//             </div>
//             <div className="flex-1">
//               <h3 className="font-medium">{item.name}</h3>
//               {/*
//               {item.selected_options && (
//                 <div className="text-sm text-gray-500 mt-1">
//                   {Object.entries(item.selected_options).map(
//                     ([groupId, optionId]) => (
//                       <div key={groupId}>
//                         Option {groupId}:{" "}
//                         {typeof optionId === "object" &&
//                         optionId !== null &&
//                         "name" in optionId
//                           ? String((optionId as { name: string }).name)
//                           : String(optionId)}
//                       </div>
//                     ),
//                   )}
//                 </div>
//               )} */}

//               {item.selected_options && item.selected_options.length > 0 && (
//                 <div className="text-sm text-gray-500 mt-1">
//                   {item.selected_options.map((option, idx) => (
//                     <div key={idx}>
//                       {option.label} (+£ {option.price_impact})
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="flex justify-between items-center mt-3">
//                 <span className="font-semibold">
//                   £
//                   {((Number(item.base_price) * item.quantity) / 100).toFixed(2)}
//                 </span>

//                 <button
//                   onClick={() => removeFromCart(item.id, item.selected_options)}
//                   className="text-sm text-red-500 hover:underline"
//                 >
//                   <Trash2 className="w-4 h-5 cursor-pointer" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       {/* SUMMARY */}
//       <div className="col-span-1 border rounded-lg p-6 h-fit">
//         <h2 className="text-lg font-semibold mb-4 tracking-wider text-center ">
//           Order Summary
//         </h2>
//         <div className="flex justify-between mb-2">
//           <span className="font-bold">Subtotal</span>
//           <span>£ {getTotal().toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between gap-3 mb-4">
//           <span className="font-bold text-md tracking-wider"> Shipping</span>
//           <span className="text-md tracking-wider">Calculated at checkout</span>
//         </div>

//         <hr className="mb-4" />

//         <div className="flex justify-between font-semibold mb-6">
//           <span className="font-bold">Total</span>
//           <span className="font-bold">£ {getTotal().toFixed(2)}</span>
//         </div>

//         <Link href="/checkout">
//           <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition cursor-pointer">
//             Proceed to Checkout
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

export default function CartPage() {
  const { cart, removeFromCart, getTotal } = useCartStore();

  // Add a consistent wrapper for empty state too
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-serif mb-4">Your suit bag is empty</h1>
        <p className="text-gray-500 mb-8">
          Discover our latest bespoke collections.
        </p>
        <Link
          href="/collections"
          className="bg-black text-white px-8 py-3 rounded-lg hover:bg-zinc-800 transition"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    /* Added pt-28 to push content below the navbar and min-h-screen */
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif mb-10 border-b border-zinc-100 pb-6">
          Your Wardrobe
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* CART ITEMS - Spanning 7 columns on large screens */}
          <div className="lg:col-span-7 space-y-6">
            {cart.map((item, idx) => (
              <div
                key={`${item.id}-${JSON.stringify(item.selected_options)}-${idx}`}
                className="flex gap-6 border-b border-zinc-100 pb-6 group"
              >
                <div className="w-32 h-40 overflow-hidden bg-zinc-50 rounded-sm shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={128}
                    height={160}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-xl">{item.name}</h3>
                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.selected_options)
                        }
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {item.selected_options &&
                      item.selected_options.length > 0 && (
                        <div className="text-[11px] uppercase tracking-widest text-zinc-400 mt-2 space-y-1">
                          {item.selected_options.map((option, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{option.label}</span>
                              <span>+£{option.price_impact}</span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="text-sm text-zinc-500">
                      Qty: {item.quantity}
                    </div>
                    <span className="font-medium text-lg">
                      £
                      {(
                        (Number(item.base_price) * item.quantity) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY - Spanning 5 columns */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-50 p-8 rounded-sm sticky top-32">
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-zinc-200 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>£{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className="text-xs uppercase tracking-tighter">
                    Complimentary
                  </span>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-200 flex justify-between items-center">
                  <span className="font-serif text-xl">Total</span>
                  <span className="text-2xl font-serif">
                    £{getTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-10">
                <button className="w-full bg-black text-white py-4 rounded-sm hover:bg-zinc-800 transition-all uppercase text-[10px] tracking-[0.2em] font-bold">
                  Proceed to Checkout
                </button>
              </Link>

              <p className="text-[10px] text-zinc-400 text-center mt-6 uppercase tracking-widest">
                Secure Checkout • Global Shipping
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
