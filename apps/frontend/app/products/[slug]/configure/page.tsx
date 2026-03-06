import { BespokeConfigurator } from "./Configurator";
import { api } from "@/lib/api/api-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// export default async function ConfigureProductPage({ params }: PageProps) {
//   const { slug } = await params;

//   // Fetch product data to pass to configurator
//   const res = await api.getProductBySlug(slug);

//   if (!res || !res.success || !res.product) {
//     return (
//       <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
//         Product not found.{" "}
//         {/* <a href="/collections" className="ml-2 text-[#c9a96e]">
//           Browse collections
//         </a> */}
//       </div>
//     );
//   }

//   return <BespokeConfigurator slug={res.product} />;
// }

export default async function ConfigureProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch product data to pass to configurator
  const res = await api.getProductBySlug(slug);

  if (!res || !res.success || !res.product) {
    return (
      <div>
        <BespokeConfigurator slug={res?.product} />;
      </div>
    );
  }
}
