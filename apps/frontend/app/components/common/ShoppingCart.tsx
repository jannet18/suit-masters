"use client";

import { useCartStore } from "@/app/stores/useCartStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ShoppingCartIcon = () => {
  const { cart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  return (
    <Link href="/cart" className="relative inline-block">
      <ShoppingBag className="h-5 w-5 text-gray-600" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-300 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center p-0.5 text-xs font-medium">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default ShoppingCartIcon;
