"use client";
import { Search, X, Tag, Package } from "lucide-react";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api/api-client";

interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  price?: number;
  image?: string;
  type: "product" | "category" | "collection";
}

const SearchBarContent = () => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const router = useRouter();
  const params = new URLSearchParams(searchParams.toString());
  const query = searchParams.get("query") || "";
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load query from URL on mount
  useEffect(() => {
    const currentQuery = searchParams.get("query");
    if (currentQuery) {
      setValue(currentQuery);
    }
  }, [searchParams]);

  // Fetch search suggestions with debouncing
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.getSearchSuggestions(query, 8);
      if (result.success && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
        setActiveSuggestionIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debouncing (300ms)
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const isShop = pathname.includes("/shop");
    if (isShop) {
      params.set("query", value);
      replace(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/shop/suits?query=${encodeURIComponent(value)}`);
    }

    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product") {
      router.push(`/products/${suggestion.slug}`);
    } else if (suggestion.type === "category") {
      router.push(`/shop/${suggestion.slug}`);
    }
    setValue(suggestion.name);
    setShowSuggestions(false);
  };

  // Handle clear button
  const onClear = () => {
    if (query) {
      params.delete("query");
      replace(`${pathname}?${params.toString()}`);
    }
    setValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else {
          onSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full lg:w-100" ref={suggestionsRef}>
      <form onSubmit={onSubmit} className="flex items-center gap-0">
        <input
          type="text"
          value={value}
          id="search"
          placeholder="Search suits, blazers, accessories..."
          className="rounded-l-md focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 bg-transparent dark:bg-transparent border border-gray-300 dark:border-gray-700 focus:border-[#c9a96e] dark:focus:border-[#c9a96e] w-full pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a96e] dark:focus:ring-[#c9a96e] transition-colors"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="absolute right-12 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={onClear}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="w-10 h-9.5 flex items-center justify-center border border-gray-300 dark:border-gray-700 border-l-0 rounded-r-md focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 bg-transparent p-0 ml-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Search"
        >
          <Search className="size-4" />
        </button>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-2"></div>
              Loading suggestions...
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                  Suggestions
                </div>
              </div>
              <div className="flex flex-col py-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index === activeSuggestionIndex ? "bg-gray-50 dark:bg-gray-800" : ""}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                  >
                    <div className="shrink-0">
                      {suggestion.type === "product" ? (
                        <Package className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Tag className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="capitalize">{suggestion.type}</span>
                        {suggestion.type === "product" && suggestion.price && (
                          <>
                            <span>•</span>
                            <span>£{suggestion.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {suggestion.type === "product" && suggestion.image && (
                      <div className="shrink-0 w-8 h-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex items-center gap-2"
                  onClick={onSubmit}
                >
                  <Search className="w-3 h-3" />
                  Search for "{value}"
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* No results found */}
      {showSuggestions &&
        !isLoading &&
        suggestions.length === 0 &&
        value.length >= 2 && (
          <div>
          {/* // <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-50 p-4 flex flex-col items-center justify-center text-center"> */}
            <div className="text-center text-gray-500 dark:text-gray-400">
              No results found for "{value}"
            </div>
            <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Try different keywords or browse categories
            </div>
          </div>
        )}
    </div>
  );
};

const SearchBar = () => {
  return (
    <Suspense
      fallback={
        <div className="relative w-full lg:w-100 mt-26">
          <div className="flex items-center gap-0">
            <div className="rounded-md bg-transparent border border-gray-300 dark:border-gray-700 w-full pl-3 pr-10 py-2 text-sm h-9.5" />
          </div>
        </div>
      }
    >
      <SearchBarContent />
    </Suspense>
  );
};

export default SearchBar;