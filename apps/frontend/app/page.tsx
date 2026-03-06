"use client";
import { useEffect, useState } from "react";
import { EditorialBanner } from "./components/common/EditorialBanner";
import { HeroSection } from "./components/common/HeroSection";
import { Newsletter } from "./components/common/Newsletter";
import { Testimonials } from "./components/common/Testimonials";
import { ProductGrid } from "./components/ProductGrid";
import { USPStrip } from "./components/USPStrip";
import { CollectionGrid } from "./components/CollectionGrid";
import { api } from "@/lib/api/api-client";
import { BespokeConfigurator } from "./products/[slug]/configure/Configurator";
import { Collection } from "@/lib/types";

// interface Collection {
//   id: number;
//   title: string;
//   subtitle: string;
//   description: string;
//   image: string;
//   tag?: string;
//   span?: string;
//   slug: string;
// }

export default function Home({ collections }: Collection) {
  const [fittingOpen, setFittingOpen] = useState(false);
  // const [collections, setCollections] = useState<Collection[]>([]);

  // useEffect(() => {
  //   async function fetchCollections() {
  //     const data = await api.getCollections();
  //     if (data.success) setCollections(data?.collections);
  //   }
  //   fetchCollections();
  // }, []);
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <main className="relative">
        <HeroSection onOpenFitting={() => setFittingOpen(true)} />
        <CollectionGrid currentSlug="" />
        <USPStrip />
        <ProductGrid />
        <EditorialBanner onOpenFitting={() => setFittingOpen(true)} />
        <Testimonials />
        <Newsletter />
      </main>
      {/* <BespokeConfigurator
        isOpen={fittingOpen}
        onClose={() => setFittingOpen(false)}
      /> */}
    </div>
  );
}
