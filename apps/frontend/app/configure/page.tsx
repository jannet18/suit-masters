// import { redirect } from "next/navigation";
// import { api } from "@/lib/api/api-client";

// interface PageProps {
//   searchParams?: { slug?: string };
// }

// export default async function ConfigurePage({ searchParams }: PageProps) {
//   const slug = searchParams?.slug;

//   // If a slug is provided, redirect directly to that product's configure page
//   if (slug) {
//     redirect(`/products/${slug}/configure`);
//   }

//   // Otherwise, fall back to the original behavior (first product)
//   try {
//     // Fetch available products
//     const result = await api.getProducts();

//     if (result.success && result.products && result.products.length > 0) {
//       // Find the first product that has a slug
//       const firstProduct = result.products[0];
//       if (firstProduct.slug) {
//         // Redirect to the first product's configure page
//         redirect(`/products/${firstProduct.slug}/configure`);
//       }
//     }

//     // If no products found or no slug, redirect to home page
//     // Alternatively, we could show an error page
//     redirect("/");
//   } catch (error) {
//     console.error("Error fetching products for configure page:", error);
//     // Fallback to home page on error
//     redirect("/");
//   }

//   // This return statement won't be reached due to redirect
//   return null;
// }

import { api } from "@/lib/api/api-client";
import { notFound } from "next/navigation";
import { BespokeConfigurator } from "../components/Configurator";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ConfigureProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch product data to pass to configurator
  const res = await api.getProductBySlug(slug);

  if (!res || !res?.success || !res.product) {
    return notFound();
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen">
      <BespokeConfigurator slug={slug} />;
    </div>
  );
}
