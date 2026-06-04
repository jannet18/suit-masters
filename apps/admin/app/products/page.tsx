import { Product, columns } from "./columns";
import { DataTable } from "./data-table";
import { adminApi, AdminProduct } from "../../lib/api-client";

const getData = async (): Promise<Product[]> => {
  try {
    const result = await adminApi.getProducts();
    if (result.success && result.products.length > 0) {
      return result.products.map((p: AdminProduct) => ({
        id: p.id,
        name: p.name,
        shortDescription: p.short_description || "",
        description: p.description || "",
        price: p.base_price / 100, // Convert cents to display price
        sizes: p.sizes || [],
        colors: p.colors || [],
        images: p.image_url ? { default: p.image_url } : ({} as Record<string, string>),
      }));
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  // Fallback: return empty array if API is unavailable
  return [];
};

const ProductsPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Products</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ProductsPage;
