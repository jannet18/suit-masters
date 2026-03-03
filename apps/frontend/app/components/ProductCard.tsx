"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block relative">
      <div className="relative aspect-3/4 overflow-hidden bg-[#151515]">
        {/* Primary Image */}
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40"
        />

        {/* The Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-12 h-1px bg-[#c9a96e] mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500" />
          <p className="text-[#f5f0eb] text-xs tracking-[0.3em] uppercase mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            Handcrafted Bespoke
          </p>
          <button className="bg-[#c9a96e] text-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
            Customise Now
          </button>
        </motion.div>

        {/* Price Tag */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10">
          <p className="text-[#c9a96e] text-[10px] font-mono">
            From £{product.base_price}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-1">
        <h4 className="font-serif text-lg text-[#f5f0eb] group-hover:text-[#c9a96e] transition-colors">
          {product.name}
        </h4>
        <p className="text-[#9a9490] text-[10px] uppercase tracking-widest font-light">
          {product.fabric_type || "Italian Wool"}
        </p>
      </div>
    </Link>
  );
}
