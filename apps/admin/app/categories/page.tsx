import { Plus } from "lucide-react";
import { adminApi } from "../../lib/api-client";
import { getSessionToken } from "../../lib/getSessionToken";
import AddCategory from "../components/AddCategory";
import { Button } from "../components/ui/button";
import { CategoryTable } from "./category-table";

const CategoriesPage = async () => {
  const result = await adminApi.getCategories(await getSessionToken());

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md flex items-center justify-between">
        <h1 className="font-semibold">Categories</h1>
        <AddCategory
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          }
        />
      </div>
      {!result.success && (
        <p role="alert" className="mb-4 text-sm text-red-500">
          Could not load categories: {result.error}
        </p>
      )}
      <CategoryTable categories={result.success ? result.categories : []} />
    </div>
  );
};

export default CategoriesPage;
