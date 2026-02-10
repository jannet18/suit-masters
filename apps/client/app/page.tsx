import Hero from "./components/Hero";
import FeaturedCollections from "./components/FeaturedCollections";
import CustomizationSection from "./components/CustomizationSection";

export default async function Home() {
  return (
    <div className="mx-auto p-4 sm:px-0 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
      <Hero />
      <FeaturedCollections />
      <CustomizationSection />
    </div>
  );
}
