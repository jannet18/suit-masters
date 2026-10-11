"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { api } from "@/lib/api/api-client";
import { useInView } from "framer-motion";
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
      <div
        className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-12 sm:grid-cols-2 sm:gap-6 sm:px-6 md:grid-cols-3 lg:grid-cols-4 lg:px-8"
        role="status"
        aria-label="Loading products"
      >
        {Array.from({ length: limit ?? 8 }, (_, index) => (
          <div key={index} className="min-w-0 animate-pulse">
            <div className="aspect-[3/4] rounded-md bg-[#2a2a2a]" />
            <div className="mt-4 h-4 w-3/4 rounded bg-[#2a2a2a]" />
            <div className="mt-2 h-3 w-1/2 rounded bg-[#2a2a2a]" />
          </div>
        ))}
        <span className="sr-only">Loading products…</span>
      </div>
    );

  return (
    <>
      <section className="relative py-24 bg-[#1a1a1a]" ref={ref}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <div className="flex max-w-full gap-1 overflow-x-auto bg-[#0f0f0f] p-1">
              {["All", "Suits", "Blazers", "Shirts", "Trousers"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] ${
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
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
