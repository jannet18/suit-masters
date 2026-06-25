"use client";

import { CartItem } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * CustomOption represents a selection in a CUSTOM product (like size, color, fabric)
 */

export interface CustomOption {
  id: number;
  group_id: number;
  label: string;
  price_impact: string;
}
/**
 * CartItem is what we store in the cart
 */
interface CartState {
  cart: CartItem[];
  globalMeasurements: Record<string, number>;
  setGlobalMeasurements: (measurements: Record<string, number>) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, selected_options?: CustomOption[]) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  /** Sync local cart with server cart (call on login) */
  syncWithServer: () => Promise<void>;
  /** Push a single item to the server cart (fire-and-forget) */
  pushToServer: (item: CartItem) => void;
  /** Remove item from server cart (fire-and-forget) */
  removeFromServer: (itemId: number) => void;
}

// Store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      hasHydrated: false,
      globalMeasurements: {
        height: 0,
        chest: 0,
        waist: 0,
        hips: 0,
        shoulder: 0,
        inseam: 0,
      },
      /**
       * Add a product to the cart
       * If the same product + same options exists, increment quantity
       * Otherwise, push as new item
       */
      setGlobalMeasurements: (measurements) =>
        set({ globalMeasurements: measurements }),
      addToCart: (item) => {
        const existingIndex = get().cart.findIndex((p) => {
          // Match by ID + options if CUSTOM
          if (p.id !== item.id) return false;

          if (p.product_type === "CUSTOM") {
            if (!p.selected_options && !item.selected_options) return true;
            if (!p.selected_options || !item.selected_options) return false;
            return (
              // p.selected_options !== undefined &&
              p.selected_options.every(
                (opt, idx) =>
                  item.selected_options &&
                  item.selected_options[idx] &&
                  opt.id === item.selected_options[idx].id,
              )
            );
          }

          return true; //For STANDARD products, just match by ID
        });

        if (existingIndex !== -1) {
          // Increase quantity if already in cart
          const updatedCart = [...get().cart];
          if (updatedCart[existingIndex]) {
            updatedCart[existingIndex]!.quantity += item.quantity;
          }
          set({ cart: updatedCart });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },
      /**
       * Remove a product entirely from the cart
       * Matches by id + options for CUSTOM
       */
      removeFromCart: (id, selected_options) => {
        set({
          cart: get().cart.filter((item) => {
            if (item.id !== id) return true;

            // If it's CUSTOM, compare selected_options
            if (item.product_type === "CUSTOM") {
              if (!item.selected_options || !selected_options) return true;

              const sameOptions =
                item.selected_options.length === selected_options.length &&
                item.selected_options.every((opt, idx) =>
                  selected_options[idx]
                    ? opt.id === selected_options[idx].id
                    : false,
                );

              return !sameOptions; // remove only exact match
            }

            return false; // remove standard product
          }),
        });
      },

      /**
       * Update the quantity of a specific product
       */
      updateQuantity: (id, quantity) => {
        const updatedCart = get().cart.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        );
        set({ cart: updatedCart });
      },

      /**
       * Calculate total price (base + custom options) * quantity
       */
      clearCart: async () => {
        set({ cart: [] });
        // Also clear server cart
        try {
          await fetch("/api/cart?clear=true", { method: "DELETE" });
        } catch {
          // Silent fail — local state is already cleared
        }
      },

      getTotal: () =>
        get().cart.reduce((acc, item) => {
          let price = Number(item.base_price);
          if (item.selected_options) {
            price += item.selected_options.reduce(
              (sum, opt) => sum + Number(opt.price_impact),
              0,
            );
          }
          return (acc + price * item.quantity);
        }, 0),

      /**
       * Sync local (localStorage) cart with the server cart.
       * Called after login to merge any pre-login items.
       */
      syncWithServer: async () => {
        try {
          // 1. Fetch server cart
          const serverRes = await fetch("/api/cart", { credentials: "include" });
          if (!serverRes.ok) return;

          const serverData = await serverRes.json();
          const serverItems: any[] = serverData.items || [];

          // 2. If server cart has items, merge them into local cart
          if (serverItems.length > 0) {
            const localCart = get().cart;
            const mergedCart = [...localCart];

            for (const serverItem of serverItems) {
              // Check if this item already exists locally
              const existingIndex = mergedCart.findIndex(
                (local) =>
                  local.id === (serverItem.product?.id ?? serverItem.id) &&
                  JSON.stringify(local.selected_options) ===
                    JSON.stringify(serverItem.selectedOptions),
              );

              if (existingIndex === -1) {
                // Item doesn't exist locally — add it
                mergedCart.push({
                  id: serverItem.product?.id ?? serverItem.id,
                  productId: String(serverItem.product?.id ?? serverItem.id),
                  name: serverItem.product?.name || "Custom Suit",
                  base_price: Number(serverItem.unit_price) || 0,
                  image_url: serverItem.product?.image || "",
                  product_type: serverItem.configuration ? "CUSTOM" : "STANDARD",
                  quantity: serverItem.qty,
                  selected_options: serverItem.selectedOptions || [],
                  configuration: serverItem.configuration || {},
                  totalPrice: Number(serverItem.total_price) || 0,
                });
              }
            }

            set({ cart: mergedCart });
          }

          // 3. Push local items to server that aren't already there
          const localCart = get().cart;
          if (localCart.length > 0) {
            fetch("/api/cart", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ action: "sync", items: localCart }),
            }).catch(() => {}); // fire and forget
          }
        } catch (error) {
          console.error("Failed to sync cart with server:", error);
        }
      },

      /**
       * Push a single item to the server cart (fire-and-forget).
       */
      pushToServer: (item: CartItem) => {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: item.id,
            qty: item.quantity,
          }),
        }).catch(() => {}); // fire and forget
      },

      /**
       * Remove item from server cart (fire-and-forget).
       */
      removeFromServer: (itemId: number) => {
        fetch(`/api/cart?itemId=${itemId}`, {
          method: "DELETE",
          credentials: "include",
        }).catch(() => {}); // fire and forget
      },
    }),
    { name: "cart-storage" }, // persisted in localStorage
  ),
);
