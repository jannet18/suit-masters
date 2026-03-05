import { api } from "@/lib/api/api-client";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch collection and flattened products
  const res = await api.getProductsInCollection(slug);

  if (!res || !res.success || !res.collection) {
    return (
      <div className="text-white p-20">
        Collection {slug} not found.{" "}
        <Link href="/" className="text-[#c9a96e]">
          Return Home
        </Link>
      </div>
    );
  }

  const { collection, products } = res;

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[50vh] flex items-center px-6 lg:px-10">
        <div className="absolute inset-0">
          <img
            src={collection.image}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto w-full">
          <h1 className="text-6xl font-serif text-[#f5f0eb] mb-4">
            {collection.name}
          </h1>
          <p className="max-w-xl text-[#9a9490]">{collection.description}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.map((product: any) => (
            <a
              key={product.id}
              href={`/products/${product.slug}/configure`}
              className="group"
            >
              <div className="aspect-3/4 overflow-hidden bg-[#1a1a1a] mb-4 relative">
                <img
                  src={product.product_image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-duration-700"
                />
                {product.product_type === "CUSTOM" && (
                  <span className="absolute top-4 right-4 bg-[#c9a96e] text-black text-[10px] px-2 py-1 font-bold uppercase">
                    Bespoke
                  </span>
                )}
              </div>
              <h2 className="text-xl text-[#f5f0eb] group-hover:text-[#c9a96e] transition-colors">
                {product.name}
              </h2>
              <p className="text-[#9a9490]">From £{product.base_price}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
