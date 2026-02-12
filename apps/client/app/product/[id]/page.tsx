import ProductDetails from "@/app/components/product/ProductDetails";
import { getProduct } from "@/app/lib/api/product";

interface Props {
  params: Promise<{ id: string }>;
}
export default async function ProductId({ params }: Props) {
  const product = await getProduct((await params).id);

  return (
    <main className="p-6">
      <ProductDetails product={product} />
    </main>
  );
}
