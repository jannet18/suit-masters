import { Plus } from "lucide-react";
import { adminApi } from "../../lib/api-client";
import { getSessionToken } from "../../lib/getSessionToken";
import AddCollection from "../components/AddCollection";
import { Button } from "../components/ui/button";
import { CollectionTable } from "./collection-table";

const CollectionsPage = async () => {
  const result = await adminApi.getCollections(await getSessionToken());

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md flex items-center justify-between">
        <h1 className="font-semibold">Collections</h1>
        <AddCollection
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Collection
            </Button>
          }
        />
      </div>
      {!result.success && (
        <p role="alert" className="mb-4 text-sm text-red-500">
          Could not load collections: {result.error}
        </p>
      )}
      <CollectionTable collections={result.success ? result.collections : []} />
    </div>
  );
};

export default CollectionsPage;
