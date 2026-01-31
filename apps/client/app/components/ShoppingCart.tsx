"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import useCartStore from "../stores/cartStore";

const ShoppingCartIcon = () => {
  const { cart, hasHydrated } = useCartStore();
  if (!hasHydrated) return null;
  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="h-6 w-6 text-gray-600" />
      <span className="absolute top-0 left-3 bg-amber-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center p-0.5 text-xs font-medium">
        {cart.reduce((acc, item) => acc + item.quantity, 0)}
      </span>
    </Link>
  );
};

export default ShoppingCartIcon;
