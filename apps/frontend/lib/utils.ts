import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Checkout pricing (shipping, VAT, promos) lives in @repo/pricing and is
// computed by order-service; see /api/orders/quote.
