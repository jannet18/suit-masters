import { api } from "@/lib/api/api-client";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

export default async function CollectionProductPage({ params }: PageProps) {
  const { slug, productSlug } = await params;

  const res = await api.getProductBySlug(productSlug);

  if (!res || !res.success || !res.product) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
        Product not found in collection {slug}.{" "}
        <Link href={`/collections/${slug}`} className="ml-2 text-[#c9a96e]">
          Back to collection
        </Link>
      </div>
    );
  }

  const product = res.product;

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center px-6 lg:px-10">
        <div className="absolute inset-0">
          <img
            src={product.product_image}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-4">
              Collection / {slug}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#f5f0eb] mb-4">
              {product.name}
            </h1>
            <p className="text-[#9a9490] max-w-xl mb-6">
              {product.description}
            </p>
            <p className="text-[#f5f0eb] text-lg mb-8">
              From{" "}
              <span className="text-[#c9a96e] font-semibold">
                £{product.base_price}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/products/${product.slug}/configure`}
                className="bg-[#c9a96e] text-black px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#b8985d] transition-colors"
              >
                Start Customisation
              </Link>
              <Link
                href={`/collections/${slug}`}
                className="text-[#c9a96e] text-xs uppercase tracking-[0.2em]"
              >
                Back to collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

