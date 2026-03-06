"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";

export default function Sidebar({ collections, slug, collection }: any) {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (slug: string) => {
    setOpen(open === slug ? null : slug);
  };

  return (
    <aside className="lg:w-1/4">
      <div className="sticky top-24 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-[#f5f0eb] mb-4 pb-3 border-b border-white/10">
          Collections
        </h3>
        <ul className="space-y-2">
          {collections &&
            collections?.map((col: any) => (
              <li key={col.id}>
                <button
                  onClick={() => toggle(col.slug)}
                  className={`h-10 flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                    col.slug === slug
                      ? "bg-[#c9a96e]/20 text-[#c9a96e] border border-[#c9a96e]/30"
                      : "text-[#9a9490] hover:text-[#f5f0eb] hover:bg-white/5"
                  }`}
                >
                  <span>{col.title}</span>
                </button>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform text-[#c9a96e] ${
                    open === col.slug ? "rotate-180" : ""
                  }`}
                />

                {open === col.slug && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link
                      href={`/collections/${col.slug}`}
                      className="flex items-center justify-between text-sm text-[#9a9490] hover:text-[#f5f0eb] py-2 px-3 rounded-md hover:bg-white/5"
                    >
                      View Collection
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </li>
            ))}
        </ul>
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-[#f5f0eb] mb-3">
            Featured Pieces
          </h4>
          <p className="text-sm text-[#9a9490]">
            Discover our curated selection of
            {collection?.name.toLowerCase()} essentials.
          </p>
        </div>
      </div>
    </aside>
  );
}
