import { api } from "@/lib/api/api-client";
import { CollectionGrid } from "../components/CollectionGrid";

export default async function CollectionsIndexPage() {
  const res = await api.getCollections();

  const collections = res?.success ? res.collections : [];

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <section className="pt-24 pb-12 px-6 lg:px-10 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-[#f5f0eb] mb-4">
          Collections
        </h1>
        <p className="text-[#9a9490] max-w-2xl">
          Explore our curated tailoring stories – from boardroom essentials to
          evening statements.
        </p>
      </section>
      <CollectionGrid collections={collections} />
    </main>
  );
}

