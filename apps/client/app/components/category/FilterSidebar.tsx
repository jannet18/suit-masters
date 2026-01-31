import { useState } from "react";

const FilterSidebar = () => {
  const [priceRanges, setPriceRanges] = useState([
    {
      id: 1,
      range: "KSh 5,000 - 20,000",
      selected: false,
    },
    {
      id: 2,
      range: "KSh 20,000 - 50,000",
      selected: false,
    },
    {
      id: 3,
      range: "Above KSh 50,000",
      selected: false,
    },
  ]);
  const [brandsExpanded, setBrandsExpanded] = useState(true);
  const [sortByExpanded, setSortByExpanded] = useState(true);
  const [sortOption, setSortOption] = useState("Relevance");
  const togglePriceRange = (id: number) => {
    setPriceRanges(
      priceRanges.map((pr) =>
        pr.id === id ? { ...pr, selected: !pr.selected } : pr
      )
    );
  };
  return (
    <div className="bg-white rounded-lg shadom-sm border border-gray-200 p-4 sticky top-24">
      <div className="space-y-6">
        {/* price range */}
        <div className="">
          <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <div key={range.id} className="flex items-center">
                <button
                  onClick={() => togglePriceRange(range.id)}
                  className="flex items-center w-full"
                >
                  <div
                    className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                      range.selected
                        ? "bg-slate-600 border-slate-600"
                        : "border-gray-300"
                    }`}
                  >
                    {range.selected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center">
                    {range.id === 3 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                    ) : range.id === 2 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-amber-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{range.range}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Brands */}
        <div>
          <button
            onClick={() => setBrandsExpanded(!brandsExpanded)}
            className="flex justify-between items-center w-full font-medium text-gray-900"
          >
            <span>Brands in Men's Suits</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${
                brandsExpanded ? "transform rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {brandsExpanded && (
            <div className="mt-3 text-gray-500 italic text-sm">
              No brands available for Men's Suits yet.
            </div>
          )}
        </div>
        {/* Sort By */}
        <div>
          <button
            onClick={() => setSortByExpanded(!sortByExpanded)}
            className="flex justify-between items-center w-full font-medium text-gray-900"
          >
            <span>Sort By</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${
                sortByExpanded ? "transform rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {sortByExpanded && (
            <div className="mt-3 space-y-2">
              {[
                {
                  id: "relevance",
                  label: "Relevance",
                },
                {
                  id: "price_low_high",
                  label: "Price: Low to High",
                },
                {
                  id: "price_high_low",
                  label: "Price: High to Low",
                },
                {
                  id: "name_a_z",
                  label: "Name: A to Z",
                },
                {
                  id: "name_z_a",
                  label: "Name: Z to A",
                },
              ].map((option) => (
                <div key={option.id} className="flex items-center">
                  <button
                    onClick={() => setSortOption(option.id)}
                    className="flex items-center w-full"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                        sortOption === option.id
                          ? "border-amber-500"
                          : "border-gray-300"
                      }`}
                    >
                      {sortOption === option.id && (
                        <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                      )}
                    </div>
                    <span>{option.label}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
