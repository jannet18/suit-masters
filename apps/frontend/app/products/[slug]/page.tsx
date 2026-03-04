// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { api } from "@/lib/api/api-client";

// export default function ProductPage({ params }: { params: { slug: string } }) {
//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchProduct = async () => {
//       // Ensure params.slug is correctly unwrapped (Next.js 15+ requires awaiting params)
//       const res = await api.getProductBySlug(params.slug);
//       if (res.success) setProduct(res.product);
//       setLoading(false);
//     };
//     fetchProduct();
//   }, [params.slug]);

//   if (loading)
//     return (
//       <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e]">
//         Loading Product...
//       </div>
//     );
//   if (!product)
//     return (
//       <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
//         Suit not found
//       </div>
//     );

//   return (
//     <main className="min-h-screen bg-[#0f0f0f] flex flex-col md:flex-row">
//       {/* Left: Product Image */}
//       <div className="w-full md:w-1/2 h-[60vh] md:h-screen sticky top-0">
//         <img
//           src={product.product_image}
//           alt={product.name}
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* Right: Product Details */}
//       <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center">
//         <p className="text-[#c9a96e] uppercase tracking-[0.3em] text-xs mb-4">
//           Handcrafted Bespoke
//         </p>
//         <h1 className="text-4xl md:text-6xl font-serif text-[#f5f0eb] mb-6">
//           {product.name}
//         </h1>
//         <p className="text-[#9a9490] text-lg mb-8 leading-relaxed">
//           {product.description}
//         </p>

//         <div className="border-t border-white/10 pt-8">
//           <p className="text-white text-2xl font-light mb-10">
//             From{" "}
//             <span className="text-[#c9a96e] font-serif ml-2">
//               £{product.base_price}
//             </span>
//           </p>

//           <button
//             onClick={() => router.push(`/products/${product.slug}/configure`)}
//             className="w-full bg-[#c9a96e] text-black font-bold py-5 uppercase tracking-widest hover:bg-[#b8985d] transition-colors"
//           >
//             Start Customization
//           </button>

//           <p className="text-center text-[#555] text-[10px] mt-4 uppercase tracking-widest">
//             Estimated tailoring time: 3-4 weeks
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }

// import { api } from "@/lib/api/api-client";
// import { BespokeConfigurator } from "./configure/Configurator";

// export default async function ProductPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const res = await api.getProductBySlug(slug); // Must include with: { customizationGroups: { with: { options: true } } }

//   if (!res.product) return <div>Product Not Found</div>;

//   return <BespokeConfigurator slug={res.product} />;
// }
import { redirect } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Skip the showcase and go straight to the studio
  redirect(`/products/${slug}/configure`);
}
