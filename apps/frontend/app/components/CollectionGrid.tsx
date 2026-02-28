"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

interface Collection {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag?: string;
  span?: string;
  slug: string;
}

interface CollectionGridProps {
  collections: Collection[];
}

export function CollectionGrid({ collections }: CollectionGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter();

  const handleCollectionClick = (slug: string) => {
    router.push(`/collections/${slug}`);
  };

  return (
    <section id="collection" className="relative py-24 bg-[#1a202c]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-3">
              Curated for You
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#f5f0eb] font-bold leading-tight">
              Shop by
              <br />
              <em className="not-italic">Collection</em>
            </h2>
          </div>
        </motion.div>

        {/* Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-6`}
        >
          {collections.map((col, i) => (
            <motion.button
              key={col.slug}
              onClick={() => handleCollectionClick(col.slug)}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`relative overflow-hidden rounded-lg group cursor-pointer ${
                col.span ?? "lg:col-span-1 lg:row-span-1"
              }`}
            >
              {/* Image */}
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f]/90 via-[#0f0f0f]/30 to-transparent" />

              {/* Tag */}
              {col.tag && (
                <span className="absolute top-4 left-4 bg-[#c9a96e] text-[#0f0f0f] text-[9px] tracking-[0.2em] uppercase font-bold px-3 py-1">
                  {col.tag}
                </span>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase mb-1">
                  {col.subtitle}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-[#f5f0eb] font-bold mb-2">
                  {col.title}
                </h3>
                <p className="text-[#9a9490] text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-4">
                  {col.description}
                </p>
                <div className="flex items-center gap-2 text-[#c9a96e] text-xs tracking-[0.2em] uppercase">
                  <span>Explore</span>
                  <ArrowRightIcon
                    size={12}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
