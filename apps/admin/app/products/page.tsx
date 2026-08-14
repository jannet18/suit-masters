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
        description: p.description || "",
        price: p.base_price,
        image: p.product_image?.default || "",
        isActive: p.is_active ?? true,
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
