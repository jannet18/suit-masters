import React, { useState } from "react";
import {
  Calendar,
  Calendar1,
  CalendarIcon,
  HeartIcon,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { Product } from "@/app/lib/types";
import useCartStore from "@/app/stores/cartStore";
import { toast } from "react-toastify/unstyled";
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
  const { addToCart } = useCartStore();
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: productTypes.size,
      selectedColor: productTypes.color,
    });
    toast.success("Product added to cart");
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
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < product.rating ? "text-yellow-400" : "text-gray-300"
              }`}
            />
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
                <X className="h-6 w-6" />
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
                <div className="text-sm text-gray-500 mb-4">{product.id}</div>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < product.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
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
                    <CalendarIcon className="h-5 w-5 mr-1 text-amber-600" />
                    {product.delivery}
                  </div>
                </div>
                <div className="space-y-4">
                  <button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2" />
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
