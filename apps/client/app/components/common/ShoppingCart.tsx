"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "../../stores/cartStore";

const ShoppingCartIcon = () => {
  const { cart } = useCartStore();

  return (
    <Link href="/cart" className="relative">
      <ShoppingBag className="h-5 w-5 text-gray-600" />
      <span className="absolute top-0 left-3.5 bg-amber-300 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center p-0.5 text-xs font-medium">
        {cart.reduce((acc, item) => acc + item.quantity, 0)}
      </span>
    </Link>
  );
};

export default ShoppingCartIcon;
