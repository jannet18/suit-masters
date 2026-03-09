import { BespokeConfigurator } from "../../../components/Configurator";
import { api } from "@/lib/api/api-client";
import { notFound } from "next/navigation";
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
