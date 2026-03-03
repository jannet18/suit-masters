"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { Collection } from "@/lib/types";

interface RelatedCollectionsProps {
  collections: Collection[];
  currentSlug: string;
}

export function RelatedCollections({
  collections,
  currentSlug,
}: RelatedCollectionsProps) {
  const router = useRouter();

  // Filter out the collection the user is currently viewing
  const otherCollections = collections.filter((c) => c.slug !== currentSlug);

  if (otherCollections.length === 0) return null;

  return (
    <section className="py-24 bg-[#0f0f0f] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-12">
        <h2 className="font-serif text-3xl text-[#f5f0eb] font-bold">
          Explore Other{" "}
          <em className="not-italic text-[#c9a96e]">Collections</em>
        </h2>
      </div>

      {/* The Slider Container */}
      <div className="relative cursor-grab active:cursor-grabbing">
        <motion.div
          drag="x"
          dragConstraints={{
            right: 0,
            left: -(otherCollections.length * 400 - 800),
          }}
          className="flex gap-8 px-6 lg:px-10"
        >
          {otherCollections.map((col) => (
            <motion.div
              key={col.id}
              onClick={() => router.push(`/collections/${col.slug}`)}
              className="shrink-0 w-87.5 md:w-112.5 group"
              whileHover={{ y: -5 }}
            >
              <div className="aspect-16/10 overflow-hidden rounded-sm mb-4 relative">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover grayscale-40 group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[#c9a96e] text-[10px] tracking-[0.2em] uppercase mb-1">
                    {col.subtitle || "The Collection"}
                  </p>
                  <h3 className="text-xl font-serif text-[#f5f0eb]">
                    {col.title}
                  </h3>
                </div>
                <div className="p-2 border border-[#c9a96e]/30 rounded-full text-[#c9a96e] group-hover:bg-[#c9a96e] group-hover:text-[#0f0f0f] transition-all">
                  <ArrowRightIcon size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
