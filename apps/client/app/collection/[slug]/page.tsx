"use client";

import CategoryNav from "@/app/components/category/CategoryNav";
import FilterSidebar from "@/app/components/category/FilterSidebar";
import ProductGrid from "@/app/components/category/ProductGrid";
import { useState } from "react";

const ProductListing = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Women's Clothing");
  // Sample products data
  const products = [
    {
      id: 1,
      name: "Maroon 5 piece Men Wedding Suit",
      image: {
        default:
          "https://5.imimg.com/data5/XV/JQ/MY-65715759/nehru-jacket-modi-jacket-500x500.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Red", "Blue", "Green"],
      price: 2415,
      originalPrice: 2465,
      discount: 2,
      sku: "SKU-O3WBHT",
      rating: 0,
      delivery: "2-4 weeks",
      category: "Wedding Suits",
    },
    {
      id: 2,
      name: "Light Brown 3 piece Wedding Suit",
      image: {
        default:
          "https://i.etsystatic.com/40108629/r/il/6e9fa5/5442139537/il_1080xN.5442139537_k204.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown", "Beige", "Black"],
      price: 697,
      originalPrice: 884,
      discount: 21,
      sku: "SKU-JJWIELXW",
      rating: 0,
      delivery: "1-2 weeks",
      category: "Wedding Suits",
    },
    {
      id: 3,
      name: "Beige 3 piece Men Wedding Suit",
      image: {
        default: "https://m.media-amazon.com/images/I/61jdMns0BPL._UY1000_.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Beige", "White", "Gray"],
      price: 3800,
      originalPrice: 3800,
      discount: 0,
      sku: "SKU-SJWBKXW",
      rating: 0,
      delivery: "0-24 hours",
      category: "Wedding Suits",
    },
    {
      id: 4,
      name: "Tuxedo Suit",
      image: {
        default:
          "https://www.brides.com/thmb/N-dw0wQ8caEbmEqp88N-mkxBao0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Wedding-Tuxedos-Kelley-Williams-Photography-Main-04d3f4e087f443de9b08b93dc9a01900.jpg",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Gray"],
      price: 599,
      originalPrice: 999,
      discount: 40,
      sku: "SKU-UMZWREKB",
      rating: 0,
      delivery: "2-4 weeks",
      category: "Tuxedos",
    },
    {
      id: 4,
      name: "Tuxedo Suit",
      image: {
        default:
          "https://rondinellituxedo.com/wp-content/uploads/2022/11/12-e1733236408782-450x533.png",
      },
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Gray"],
      price: 599,
      originalPrice: 999,
      discount: 40,
      sku: "SKU-UMZWREKB",
      rating: 0,
      delivery: "2-4 weeks",
      category: "Tuxedos",
    },
  ];
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryNav
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div
            className={`lg:w-1/4 xl:w-1/5 ${
              mobileFiltersOpen ? "block" : "hidden"
            } lg:block`}
          >
            <FilterSidebar />
          </div>
          <div className="w-full lg:w-3/4 xl:w-4/5">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-medium text-gray-800">
                {selectedCategory}
              </h1>
              <button
                onClick={toggleMobileFilters}
                className="lg:hidden flex items-center text-gray-600 hover:text-gray-900"
              >
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm0 8a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm0 8a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1z"
                  />
                </svg>
                Filters
              </button>
            </div>
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductListing;
