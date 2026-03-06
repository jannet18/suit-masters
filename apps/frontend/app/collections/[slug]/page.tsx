import { api } from "@/lib/api/api-client";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRight,
  Home,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import Sidebar from "@/app/components/Sidebar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await api.getProductsInCollection(slug);

  if (!res || !res.success || !res.collection) {
    return {
      title: "Collection Not Found",
      description: "The requested collection could not be found.",
    };
  }

  const { collection } = res;
  return {
    title: `${collection.name} Collection | Suit Masters`,
    description: collection.description,
    openGraph: {
      title: `${collection.name} Collection`,
      description: collection.description,
      images: [collection.image],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch collection and flattened products
  const [collectionRes, collectionsRes] = await Promise.all([
    api.getProductsInCollection(slug),
    api.getCollections(),
  ]);

  if (!collectionRes || !collectionRes.success || !collectionRes.collection) {
    return (
      <div className="text-white p-20 capitalize ">
        {slug}
        <span>Collection not found.</span>
        <Link href="/" className="text-[#c9a96e]">
          Return Home
        </Link>
      </div>
    );
  }

  const { collection, products } = collectionRes;
  const collections = collectionsRes.success ? collectionsRes.collections : [];

  // Determine product link based on product_type
  const getProductLink = (product: any) => {
    if (product.product_type === "STANDARD") {
      return `/products/${product.slug}`;
    }
    // CUSTOM products go to configurator
    return `/products/${product.slug}/configure`;
  };

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      {/* Breadcrumbs */}
      <nav className="py-6 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="flex items-center text-sm text-[#9a9490]">
          <Link href="/" className="flex items-center hover:text-[#c9a96e]">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/collections" className="hover:text-[#c9a96e]">
            Collections
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-[#f5f0eb]">{collection.name}</span>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative h-[50vh] flex items-center px-6 lg:px-10">
        <div className="absolute inset-0">
          <img
            src={collection.image}
            className="w-full h-full object-cover opacity-30"
            alt={collection.name}
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
          <h1 className="text-6xl font-serif text-[#f5f0eb] mb-4">
            {collection.name}
          </h1>
          <p className="max-w-xl text-[#9a9490]">{collection.description}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col lg:flex-row gap-10">
        {/* Collection Navigator Sidebar */}
        <>
          <Sidebar />
        </>
        {/* Product Grid */}
        <section className="lg:w-3/4 flex flex-col items-center justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-serif text-[#f5f0eb] mb-2 text-center">
              {products.length} Pieces
            </h2>
            <p className="text-[#9a9490]">
              Explore our {collection.name.toLowerCase()} collection featuring
              {/* {products.filter((p: any) => p.product_type === "CUSTOM").length}{" "} */}
              bespoke items
              {/* {
                products.filter((p: any) => p.product_type === "STANDARD")
                  .length
              }
              ready-to-wear pieces. */}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={getProductLink(product)}
                className="group block"
              >
                <div className="aspect-3/4 overflow-hidden bg-[#1a1a1a] mb-4 relative rounded-lg">
                  <img
                    src={product.product_image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={product.name}
                  />
                  {product.product_type === "CUSTOM" && (
                    <span className="absolute top-4 right-4 bg-[#c9a96e] text-black text-[10px] px-3 py-1.5 font-bold uppercase tracking-wider">
                      Bespoke
                    </span>
                  )}
                  {product.product_type === "STANDARD" && (
                    <span className="absolute top-4 right-4 bg-[#4a5568] text-white text-[10px] px-3 py-1.5 font-bold uppercase tracking-wider">
                      Ready-to-Wear
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-[#f5f0eb] group-hover:text-[#c9a96e] transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-sm text-[#9a9490]">
                      {product.category_name}
                    </span>
                  </div>
                  <p className="text-[#c9a96e] font-medium">
                    From £ {product.base_price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[#9a9490] gap-3">
                    <span className="inline-flex items-center gap-3">
                      {product.product_type === "CUSTOM"
                        ? "Custom Tailored"
                        : "Standard Sizing"}
                    </span>
                    {/* <span className="mx-2">•</span> */}
                    <span className="flex items-center gap-0">
                      View Details
                      <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-[#9a9490]">
                No products found in this collection.
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center mt-4 text-[#c9a96e] hover:text-[#e6c27e]"
              >
                Browse other collections
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// apps/frontend/app/collections/[slug]/page.tsx
// import { ProductCard } from "@/app/components/ProductCard";
// import { api } from "@/lib/api/api-client";
// import Link from "next/link";
// import { notFound } from "next/navigation";

// export default async function CollectionPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const res = await api.getProductsInCollection(slug);
//   if (!res?.success || !res.collection) return notFound();
//   const [collectionRes, allColsRes] = await Promise.all([
//     api.getProductsInCollection(slug),
//     api.getCollections(),
//   ]);

//   if (!collectionRes?.success) return notFound();

//   const { collection, products } = collectionRes;
//   const allCollections = allColsRes.success ? allColsRes.collections : [];

//   return (
//     <>
//       <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto px-6 py-20">
//         {/* Sidebar Navigation */}
//         <aside className="lg:w-1/4 sticky top-24 h-fit">
//           <h3 className="text-[#f5f0eb] font-serif text-xl mb-6">
//             Explore Styles
//           </h3>
//           <nav className="flex flex-col gap-2">
//             {allCollections.map((col: any) => (
//               <Link
//                 key={col.id}
//                 href={`/collections/${col.slug}`}
//                 className={`p-3 rounded transition ${col.slug === slug ? "bg-[#c9a96e] text-black" : "text-[#9a9490] hover:bg-white/5"}`}
//               >
//                 {col.name}
//               </Link>
//             ))}
//           </nav>
//         </aside>

//         {/* The Product Mixture Grid */}
//         <section className="lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-8">
//           {products.map((product: any) => (
//             <Link
//               key={product.id}
//               href={
//                 product.product_type === "CUSTOM"
//                   ? `/products/${product.slug}/configure`
//                   : `/products/${product.slug}`
//               }
//               className="group"
//             >
//               <div className="aspect-3/4 overflow-hidden bg-[#1a1a1a] relative">
//                 <img
//                   src={product.product_image}
//                   className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
//                 />
//                 <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-[#c9a96e] px-3 py-1 text-xs tracking-widest">
//                   {product.product_type}
//                 </div>
//               </div>
//               <h4 className="mt-4 text-[#f5f0eb] font-medium">
//                 {product.name}
//               </h4>
//               <p className="text-[#c9a96e]">£{product.base_price}</p>
//             </Link>
//           ))}

//           <main className="min-h-screen bg-[#0f0f0f]">
//             {/* Editorial Header */}
//             <header className="relative h-[60vh] flex items-end pb-16 px-6 lg:px-10">
//               <img
//                 src={res.collection.image}
//                 className="absolute inset-0 w-full h-full object-cover opacity-40"
//                 alt=""
//               />
//               <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-transparent to-transparent" />

//               <div className="relative z-10 max-w-7xl mx-auto w-full">
//                 <h1 className="text-6xl md:text-8xl font-serif text-[#f5f0eb] uppercase mb-4">
//                   {res.collection.name}
//                 </h1>
//                 <p className="text-[#9a9490] max-w-xl text-lg italic">
//                   {res.collection.description}
//                 </p>
//               </div>
//             </header>

//             {/* The Product Grid */}
//             <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
//                 {res.products.map((product: any) => (
//                   <ProductCard key={product.id} product={product} />
//                 ))}
//               </div>
//             </section>
//           </main>
//         </section>
//       </div>
//     </>
//   );
// }
