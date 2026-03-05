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
