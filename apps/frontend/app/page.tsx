"use client";
import { useEffect, useState } from "react";
import { EditorialBanner } from "./components/common/EditorialBanner";
import { HeroSection } from "./components/common/HeroSection";
import { Newsletter } from "./components/common/Newsletter";
import { Testimonials } from "./components/common/Testimonials";
import { ProductGrid } from "./components/ProductGrid";
import { USPStrip } from "./components/USPStrip";
import { CollectionGrid } from "./components/CollectionGrid";

export default function Home() {
  const [fittingOpen, setFittingOpen] = useState(false);

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
    </div>
  );
}
