"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import { ProductCard } from "./ProductCard";
export function ProductGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-80px",
  });
  return (
    <section className="py-24 bg-[#1a1a1a]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={
            inView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.7,
          }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
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
            {["All", "Suits", "Blazers", "Trousers"].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-200 ${i === 0 ? "bg-[#c9a96e] text-[#0f0f0f]" : "text-[#9a9490] hover:text-[#f5f0eb]"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <ProductCard
            index={0}
            name="The Mayfair — Charcoal Wool Suit"
            price={895}
            originalPrice={1195}
            image="https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=600&q=80&fit=crop"
            hoverImage="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80&fit=crop"
            tag="Sale"
            colors={["#3a3a3a", "#1a1a2e", "#2d1b0e"]}
          />
          <ProductCard
            index={1}
            name="The Savile — Navy Pinstripe"
            price={1150}
            image="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop"
            hoverImage="https://images.unsplash.com/photo-1598808503746-f34cfb0e0e2e?w=600&q=80&fit=crop"
            tag="New"
            colors={["#1a1a2e", "#0d1b2a", "#2a2a2a"]}
          />
          <ProductCard
            index={2}
            name="The Kensington — Ivory Linen"
            price={750}
            image="https://images.unsplash.com/photo-1598808503746-f34cfb0e0e2e?w=600&q=80&fit=crop"
            colors={["#f5f0eb", "#e8ddd0", "#d4c9b8"]}
          />
          <ProductCard
            index={3}
            name="The Chelsea — Black Tuxedo"
            price={1295}
            image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80&fit=crop"
            tag="Exclusive"
            colors={["#0f0f0f", "#1a1a1a"]}
          />
        </div>

        {/* CTA */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={
            inView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.6,
            delay: 0.5,
          }}
          className="text-center mt-14"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-3 border border-[#c9a96e] text-[#c9a96e] px-10 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#c9a96e] hover:text-[#0f0f0f] transition-all duration-300"
          >
            View All Products
            <ArrowRightIcon
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
