import ProductGrid from "./components/category/ProductGrid";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Featured Products</h1>
      <ProductGrid />
    </main>
  );
}
