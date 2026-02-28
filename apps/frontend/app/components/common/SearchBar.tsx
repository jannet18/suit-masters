"use client";
// import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);
  const query = searchParams.get("query") || "";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    const isShop = pathname.includes("/shop");
    if (isShop) {
      params.set("query", value);
      replace(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/shop?query=${value}`);
    }

    console.log("Search for:", value);
  };
  const onClear = () => {
    setValue("");
    const isShop = pathname.includes("/shop");
    if (isShop) {
      params.delete("query");
      replace(`${pathname}?${params.toString()}`);
    }
  };
  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full lg:w-100 flex items-center gap-0"
    >
      <input
        type="text"
        value={value}
        id="search"
        placeholder="Search..."
        className="rounded-md focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 bg-transparent dark:bg-transparent border border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-500 w-full pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700"
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button className="absolute right-8" onClick={() => setValue("")}>
          <X className="w-4 h-4 text-muted-foreground cursor-pointer hover:opacity-75 transition ease-in-out duration-150" />
        </button>
      )}
      <button className="w-10 h-8  flex items-center justify-center rounded-r-md focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 bg-transparent border p-0 ml-1">
        <Search className="size-4 cursor-pointer" />
      </button>
    </form>
  );
};

export default SearchBar;
