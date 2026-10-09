import { Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { adminApi } from "../../lib/api-client";
import { getSessionToken } from "../../lib/getSessionToken";
import { deleteProducts } from "../../lib/catalog-actions";
import AddProduct from "../components/AddProduct";
import { Button } from "../components/ui/button";

const ProductsPage = async () => {
  const result = await adminApi.getCatalogProducts(await getSessionToken());

  const deactivateSelected = async (ids: (string | number)[]) => {
    "use server";
    return deleteProducts(ids.map(Number));
  };

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md flex items-center justify-between">
        <h1 className="font-semibold">All Products</h1>
        <AddProduct
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          }
        />
      </div>
      {!result.success && (
        <p role="alert" className="mb-4 text-sm text-red-500">
          Could not load products: {result.error}
        </p>
      )}
      <DataTable
        columns={columns}
        data={result.success ? result.products : []}
        onDeleteSelected={deactivateSelected}
        deleteLabel="Deactivate selected"
      />
    </div>
  );
};

export default ProductsPage;
