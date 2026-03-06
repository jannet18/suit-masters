import { api } from "@/lib/api/api-client";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ query?: string }>;
}) {
  const { category } = await params;
  const { query } = await searchParams;

  // Fetch directly on the server - no useEffect needed!
  const data = await api.getProducts({
    category: category,
    search: query || "",
  });

  const products = data.success ? data.products : [];

  return (
    <div className="p-10 bg-[#0f0f0f] min-h-screen">
      {query && (
        <h2 className="mb-6 text-xl text-[#f5f0eb]">
          Results for <span className="font-bold text-[#c9a96e]">{query}</span>
        </h2>
      )}

      {products.length === 0 ? (
        <div className="h-40 flex items-center justify-center border border-dashed border-[#333] text-[#9a9490]">
          No products found in this category.
        </div>
      ) : (
        /* Pass to a simple grid component */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <a key={p.id} href={`/products/${p.slug}`} className="group">
              <div className="aspect-square overflow-hidden bg-[#1a1a1a] mb-2">
                <img
                  src={p.product_image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-[#f5f0eb]">{p.name}</h3>
              <p className="text-[#c9a96e]">£{p.base_price}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
