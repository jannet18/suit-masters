import { fetchProducts } from "../lib/api";

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {products.map((product: any) => (
        <div key={product.id} className="rounded-lg border border-gray-700 p-4">
          <img
            src={product.product_image}
            alt={product.name}
            className="h-48 w-full object-cover rounded"
          />
          <h3 className="mt-4 text-lg font-semibold text-white">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm">{product.description}</p>
          <p className="mt-2 font-bold text-indigo-400">
            KES {product.base_price}
          </p>
        </div>
      ))}
    </div>
  );
}
