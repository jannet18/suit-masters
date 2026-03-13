// "use client";
// import { useRef, useState, useEffect } from "react";
// import { motion, useInView } from "framer-motion";
// import { ArrowRightIcon } from "lucide-react";
// import { ProductCard } from "./ProductCard";
// import { api } from "@/lib/api/api-client";

// interface Product {
//   id: number;
//   slug: string;
//   name: string;
//   base_price: number;
//   product_image: string | { default: string };
//   product_type?: "STANDARD" | "CUSTOM";
//   category_name: string;
// }

// export function ProductGrid({ limit }: { limit?: number }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, {
//     once: true,
//     margin: "-80px",
//   });

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState("All");

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         setLoading(true);
//         const data = await api.getProducts();
//         if (data.success && data.products) {
//           // Map API response to Product type
//           const mappedProducts: Product[] = data.products.map((p: any) => ({
//             id: p.id,
//             slug: p.slug,
//             name: p.name,
//             base_price: p.base_price,
//             product_image: p.product_image,
//             product_type: p.product_type,
//           }));
//           setProducts(mappedProducts);
//         } else {
//           setProducts([]);
//         }
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setError("Failed to load featured products");
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProducts();
//   }, []);
//   const filtered = products.filter(
//     (p) => activeTab === "All" || p.category_name === activeTab,
//   );

//   const displayItems = limit ? filtered.slice(0, limit) : filtered;

//   if (loading)
//     return (
//       <div className="grid grid-cols-4 gap-8 animate-pulse">
//         {/* Skeletons */}
//       </div>
//     );
//   return (
//     <section className="py-24 bg-[#1a1a1a]" ref={ref}>
//       <div className="max-w-7xl mx-auto px-6 lg:px-10">
//         {/* Header */}
//         <motion.div
//           initial={{
//             opacity: 0,
//             y: 30,
//           }}
//           animate={
//             inView
//               ? {
//                   opacity: 1,
//                   y: 0,
//                 }
//               : {}
//           }
//           transition={{
//             duration: 0.7,
//           }}
//           className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
//         >
//           <div>
//             <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-3">
//               Handpicked
//             </p>
//             <h2 className="font-serif text-4xl md:text-5xl text-[#f5f0eb] font-bold leading-tight">
//               Featured Pieces
//             </h2>
//           </div>

//           {/* Filter Tabs */}
//           {/* <div className="flex gap-1 bg-[#0f0f0f] p-1">
//             {["All", "Suits", "Blazers", "Trousers"].map((tab, i) => (
//               <button
//                 key={tab}
//                 className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-200 ${i === 0 ? "bg-[#c9a96e] text-[#0f0f0f]" : "text-[#9a9490] hover:text-[#f5f0eb]"}`}
//               >
//                 {tab}
//               </button>
//             ))}

//           </div> */}
//           <div className="flex gap-6 mb-12 border-b border-white/10 pb-4">
//             {" "}
//             {["All", "Suits", "Blazers", "Shirts"].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`text-[10px] uppercase tracking-widest transition-colors ${
//                   activeTab === tab
//                     ? "text-[#c9a96e] border-b border-[#c9a96e]"
//                     : "text-[#9a9490]"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </motion.div>

//         {/* Loading State */}
//         {loading && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="aspect-3/4 bg-[#151515] animate-pulse" />
//             ))}
//           </div>
//         )}

//         {/* Error State */}
//         {error && !loading && (
//           <div className="text-center py-12">
//             <p className="text-[#9a9490]">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 text-[#c9a96e] text-sm hover:underline"
//             >
//               Try again
//             </button>
//           </div>
//         )}

//         {/* Product Grid */}
//         {!loading && !error && (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
//               {displayItems.slice(0, 4).map((product, id) => (
//                 <ProductCard key={id} product={product} />
//               ))}
//             </div>

//             {/* Show message if no products */}
//             {displayItems.length === 0 && !loading && !error && (
//               <div className="text-center py-12">
//                 <p className="text-[#9a9490]">No featured products available</p>
//               </div>
//             )}
//           </>
//         )}

//         {/* CTA */}
//         <motion.div
//           initial={{
//             opacity: 0,
//             y: 20,
//           }}
//           animate={
//             inView
//               ? {
//                   opacity: 1,
//                   y: 0,
//                 }
//               : {}
//           }
//           transition={{
//             duration: 0.6,
//             delay: 0.5,
//           }}
//           className="text-center mt-14"
//         >
//           <a
//             href=""
//             className="group inline-flex items-center gap-3 border border-[#c9a96e] text-[#c9a96e] px-10 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#c9a96e] hover:text-[#0f0f0f] transition-all duration-300"
//           >
//             View All Products
//             <ArrowRightIcon
//               size={14}
//               className="group-hover:translate-x-1 transition-transform duration-200"
//             />
//           </a>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// apps/frontend/components/products/ProductGrid.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { api } from "@/lib/api/api-client";
import { motion, useInView } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function ProductGrid({ limit }: { limit?: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-80px",
  });

  // Sync activeTab with URL param
  useEffect(() => {
    if (categoryParam) {
      const category =
        categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      if (["Suits", "Blazers", "Shirts", "Trousers"].includes(category)) {
        setActiveTab(category);
      }
    }
  }, [categoryParam]);

  useEffect(() => {
    async function load() {
      const res = await api.getProducts();
      if (res?.success) setProducts(res.products);
      setLoading(false);
    }
    load();
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === "All") {
      router.push("/");
    } else {
      router.push(`/?category=${tab.toLowerCase()}`);
    }
  };

  const filtered = products.filter(
    (p) => activeTab === "All" || p.category_name === activeTab,
  );

  const displayItems = limit ? filtered.slice(0, limit) : filtered;

  if (loading)
    return (
      <div className="grid grid-cols-4 gap-8 animate-pulse">
        {/* Skeletons */}
      </div>
    );

  return (
    <>
      {/* <div>
        <div className="flex gap-6 mb-12 border-b border-white/10 pb-4">
          {["All", "Suits", "Blazers", "Shirts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? "text-[#c9a96e] border-b border-[#c9a96e]"
                  : "text-[#9a9490]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div> */}

      <section className="relative py-24 bg-[#1a1a1a]" ref={ref}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-3">
                Handpicked
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#f5f0eb] font-bold leading-tight">
                Featured Pieces
              </h2>
            </div>
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-[#0f0f0f] p-1">
              {["All", "Suits", "Blazers", "Shirts", "Trousers"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? "text-[#c9a96e] border-b border-[#c9a96e]"
                      : "text-[#9a9490]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {displayItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {/* CTA */}
          <div className="text-center mt-14">
            <Link
              href="#"
              className="group inline-flex items-center gap-3 border border-[#c9a96e] text-[#c9a96e] px-10 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#c9a96e] hover:text-[#0f0f0f] transition-all duration-300"
            >
              View All Products
              <ArrowRightIcon
                size={14}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
