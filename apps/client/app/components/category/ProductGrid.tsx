import React from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/app/lib/types";
interface ProductGridProps {
  products: Product[] | null;
}
const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products?.map((product, id) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
};
export default ProductGrid;
