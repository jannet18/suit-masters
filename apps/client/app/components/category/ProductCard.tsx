import React, { useState } from "react";
import { Calendar, HeartIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Product } from "@/app/libs/types";
interface ProductCardProps {
  product: Product;
}
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [productTypes, setProductTypes] = useState({
    size: product?.sizes?.[0] || "",
    color: product?.colors?.[0] || "",
  });
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };
  const toggleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickViewOpen(!isQuickViewOpen);
  };

  const handleProductType = ({
    type,
    value,
  }: {
    type: "size" | "color";
    value: string;
  }) => {
    setProductTypes((prev) => ({ ...prev, [type]: value }));
  };
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
      <div className="aspect-4/5 relative overflow-hidden bg-gray-100">
        <Link href={`/product/${product.id}`} className="block relative">
          <img
            // src={product.image}
            src={product.image[productTypes.color] ?? product.image.default}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {product.discount > 0 && (
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold text-white ${
              product.discount >= 30 ? "bg-red-500" : "bg-orange-500"
            }`}
          >
            {product.discount}% OFF
          </div>
        )}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm transition-colors hover:bg-gray-100"
        >
          <HeartIcon
            className={`h-5 w-5 ${
              isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400"
            }`}
          />
        </button>
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={toggleQuickView}
            className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            Quick View
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{product.sku}</div>
        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 h-12">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          {/* SIZES   */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500">Size</span>
            <select
              name="size"
              id="size"
              className="ring ring-gray-300 rounded-md px-2 py-1 text-sm"
              onChange={(e) =>
                handleProductType({ type: "size", value: e.target.value })
              }
            >
              {product?.sizes?.map((size) => (
                <option key={size} value={size}>
                  {size.toLocaleUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {/* COLORS */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500">Color</span>
            <div className="flex items-center gap-2">
              {product.colors.map((color) => (
                <div
                  className={`cursor-pointer border ${productTypes.color === color ? "border-gray-400" : "border-gray-200"} rounded-full p-0.5`}
                  key={color}
                  onClick={() =>
                    handleProductType({ type: "color", value: color })
                  }
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 m-3">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${
                i < product.rating ? "text-yellow-400" : "text-gray-300"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}

          <span className="text-xs text-gray-500">({product.rating || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              KSh {product.price.toLocaleString()}
            </div>
            {/* {product.originalPrice > product.price && (
                <div className="text-sm text-gray-500 line-through">
                  KSh {product.originalPrice.toLocaleString()}
                </div>
              )} */}
          </div>

          {/* <div className="text-sm text-gray-500 flex items-center">
              <Calendar className="mr-1" />

              {product.delivery}
            </div> */}
        </div>
      </div>
      <div className="px-4 pb-4">
        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-md transition-colors flex items-center justify-center cursor-pointer">
          <ShoppingCart className="mr-2" />
          Add to Cart
        </button>
      </div>
      {isQuickViewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-medium">Quick View</h2>
              <button
                onClick={toggleQuickView}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img
                  src={
                    product.image[productTypes.color] ?? product.image.default
                  }
                  alt={product.name}
                  className="w-full h-auto object-cover rounded"
                />
              </div>
              <div className="md:w-1/2 md:pl-6 mt-4 md:mt-0">
                <h3 className="text-xl font-medium mb-2">{product.name}</h3>
                <div className="text-sm text-gray-500 mb-4">{product.sku}</div>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < product.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-500">
                    ({product.rating || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    KSh {product.price.toLocaleString()}
                  </div>
                  {/* {product.originalPrice > product.price && (
                    <div className="text-lg text-gray-500 line-through ml-2">
                      KSh {product.originalPrice.toLocaleString()}
                    </div>
                  )} */}
                  {product.discount > 0 && (
                    <div className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-sm rounded-md">
                      Save {product.discount}%
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <div className="font-medium mb-2">Delivery</div>
                  <div className="flex items-center text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {product.delivery}
                  </div>
                </div>
                <div className="space-y-4">
                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className="w-full border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-500 font-medium py-3 rounded-md transition-colors flex items-center justify-center"
                  >
                    <HeartIcon
                      className={`h-5 w-5 mr-1 ${
                        isWishlisted ? "text-red-500 fill-red-500" : ""
                      }`}
                    />
                    {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductCard;
