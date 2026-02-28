"use client";
import { useEffect, useState } from "react";
import { EditorialBanner } from "./components/common/EditorialBanner";
import { Footer } from "./components/common/Footer";
import { HeroSection } from "./components/common/HeroSection";
import { Newsletter } from "./components/common/Newsletter";
import { Testimonials } from "./components/common/Testimonials";
import { CustomFitting } from "./components/CustomFitting";
import { ProductGrid } from "./components/ProductGrid";
import { USPStrip } from "./components/USPStrip";
import { CollectionGrid } from "./components/CollectionGrid";
import { api } from "@/lib/api/api-client";
import Navbar from "./components/common/Navbar";

interface Collection {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag?: string;
  span?: string;
  slug: string;
}

export default function Home() {
  const [fittingOpen, setFittingOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    async function fetchCollections() {
      const data = await api.getCollections();
      if (data.success) setCollections(data.collections);
    }
    fetchCollections();
  }, []);
  return (
    <div className="min-h-screen bg-[#1a202c]">
      <Navbar onOpenFitting={() => setFittingOpen(true)} />
      <main>
        <HeroSection onOpenFitting={() => setFittingOpen(true)} />
        <USPStrip />
        <CollectionGrid collections={collections} />
        <ProductGrid />
        <EditorialBanner onOpenFitting={() => setFittingOpen(true)} />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
      <CustomFitting
        isOpen={fittingOpen}
        onClose={() => setFittingOpen(false)}
      />
    </div>
  );
}
