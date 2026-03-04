// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { api } from "@/lib/api/api-client";
// import { ArrowRightIcon } from "lucide-react";
// import { motion } from "framer-motion";
// import { RelatedCollections } from "@/app/components/RelatedCollection";

// export default function CollectionPage() {
//   const { slug } = useParams();
//   const [collection, setCollection] = useState<any>(null);
//   const [products, setProducts] = useState<any[]>([]);
//   const [allCollections, setAllCollections] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const sortedProducts = [...products].sort((a, b) =>
//     b.is_featured === a.is_featured ? 0 : b.is_featured ? 1 : -1,
//   );
//   useEffect(() => {
//     async function loadData() {
//       try {
//         if (!slug) return;
//         const res = await api.getProductsInCollection(slug as string);
//         const allRes = await api.getCollections();
//         if (res.success) {
//           setCollection(res.collection);
//           setProducts(res.products);
//           setAllCollections(allRes.collections);
//         }
//       } catch (err) {
//         console.error("Failed to load collection", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadData();
//   }, [slug]);

//   if (loading)
//     return (
//       <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e]">
//         Loading...
//       </div>
//     );
//   if (!collection)
//     return (
//       <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-[#f5f0eb]">
//         Collection not found.
//       </div>
//     );

//   return (
//     <main className="bg-[#0f0f0f] min-h-screen">
//       {/* Hero Header */}
//       <section className="relative h-[40vh] flex items-center px-6 lg:px-10">
//         <div className="absolute inset-0 overflow-hidden">
//           <img
//             src={collection.image}
//             alt=""
//             className="w-full h-full object-cover opacity-30"
//           />
//           <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] to-transparent" />
//         </div>

//         <div className="relative max-w-7xl mx-auto w-full">
//           <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-4">
//             Collection
//           </p>
//           <h1 className="text-5xl md:text-7xl font-serif text-[#f5f0eb] font-bold mb-6">
//             {collection.name}
//           </h1>
//           <p className="max-w-2xl text-[#9a9490] text-lg leading-relaxed">
//             {collection.description}
//           </p>
//         </div>
//       </section>
//       {/* Products Grid */}
//       <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
//           {sortedProducts.map((product) => (
//             <motion.div
//               key={product.id}
//               whileHover={{ y: -10 }}
//               onClick={() => router.push(`/products/${product.slug}`)}
//               className="group cursor-pointer"
//             >
//               <div className="aspect-3/4 overflow-hidden bg-[#1a1a1a] mb-6 relative">
//                 <img
//                   src={product.product_image}
//                   alt={product.name}
//                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                 />
//                 {product.product_type === "CUSTOM" && (
//                   <span className="absolute top-4 right-4 bg-[#c9a96e] text-[#0f0f0f] text-[10px] px-3 py-1 font-bold uppercase tracking-tighter">
//                     Bespoke
//                   </span>
//                 )}
//               </div>
//               <h2 className="text-xl font-serif text-[#f5f0eb] mb-1 group-hover:text-[#c9a96e] transition-colors">
//                 {product.name}
//               </h2>
//               <div className="flex items-center justify-between">
//                 <p className="text-[#9a9490] font-sans text-sm">
//                   From £{product.base_price}
//                 </p>
//                 <div className="flex items-center gap-2 text-[#c9a96e] text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
//                   <span>View Details</span>
//                   <ArrowRightIcon size={12} />
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </section>
//       <RelatedCollections collections={allCollections} currentSlug={"slug"} />
//     </main>
//   );
// }

// app/collections/[slug]/page.tsx
// import { api } from "@/lib/api/server-api";
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
              href={`/product/${product.slug}/configure`}
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
