import { BespokeConfigurator } from "@/app/components/Configurator";
import { api } from "@/lib/api/api-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ConfigureProductPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch the exact product details from your catalogs
  const res = await api.getProductBySlug(slug);

  // 2. Safeguard with a 404 response if the product is deleted or missing
  if (!res || !res?.success || !res.product) {
    return notFound();
  }

  // 3. Mount your premium unified tailoring studio
  return (
    <div className="bg-[#0f0f0f] min-h-screen">
      <BespokeConfigurator slug={slug} />
    </div>
  );
}