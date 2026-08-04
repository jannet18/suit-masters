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
  hasHydrated: boolean;
  globalMeasurements: Record<string, number>;
  setGlobalMeasurements: (measurements: Record<string, number>) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, selectedOptions?: CustomOption[]) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  /** Sync local cart with server cart (call on login) */
  syncWithServer: () => Promise<void>;
  /** Push a single item to the server cart (fire-and-forget) */
  pushToServer: (item: CartItem) => void;
  /** Remove item from server cart (fire-and-forget) */
  removeFromServer: (itemId: number, selectedOptions?: CustomOption[]) => void;
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
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((p) => {
          // Match by ID + options if CUSTOM
          if (Number(p.id) !== Number(item.id)) return false;

          if (p.productType === "CUSTOM") {
            if (!p.selectedOptions || !item.selectedOptions) return p.selectedOptions === item.selectedOptions;
            if (p.selectedOptions.length !== item.selectedOptions.length) return false;
            const pOptionsIds = new Set(p.selectedOptions.map((o: CustomOption) => o.id));
            return item.selectedOptions.every((opt: CustomOption) => pOptionsIds.has(opt.id));
          }
          return true; // Match standard product solely by item identification code
        });

        let updateCart = [...currentCart];
        if (existingIndex !== -1 && updateCart[existingIndex]) {
          // Explicitly merge quantities to prevent structural state reference loss
          const existingItem = updateCart[existingIndex]!;
          existingItem.quantity += item.quantity;
          get().pushToServer(existingItem);
        } else {
          updateCart.push(item);
          get().pushToServer(item);
        }
        set({ cart: updateCart });
      },
      /**
       * Remove a product entirely from the cart
       * Matches by id + options for CUSTOM
       */
      removeFromCart: (id, selectedOptions) => {
        const remainingCart = get().cart.filter((item) => {
          if (Number(item.id) !== Number(id)) return true;

          if (item.productType === "CUSTOM") {
            if (!item.selectedOptions || !selectedOptions) return true;
            if (item.selectedOptions.length !== selectedOptions.length) return true;

            const targetOptionIds = new Set(selectedOptions.map((o: CustomOption) => o.id));
            const matchesAllOptions = item.selectedOptions.every((opt: CustomOption) => targetOptionIds.has(opt.id));

            return !matchesAllOptions; // Keep the item if it doesn't match the selection precisely
          }
          return false; // Evict matched standard product
        });
        set({ cart: remainingCart });
        get().removeFromServer(id, selectedOptions);
      },
      /**
       * Update the quantity of a specific product
       */
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) return;
        const updatedCart = get().cart.map((item) => {
          if (Number(item.id) === Number(id)) {
            const mutatedItem = { ...item, quantity };
            get().pushToServer(mutatedItem); // keep server state syncs with local mutations
            return mutatedItem;
          }
          return item;
        });
        set({ cart: updatedCart });
      },

      /**
       * Calculate total price (base + custom options) * quantity
       */
      clearCart: async () => {
        set({ cart: [] });
        // Also clear server cart
        try {
          await fetch("/api/cart?clear=true", { method: "DELETE", credentials: "include" });
        } catch (error) {
          // Silent fail — local state is already cleared
          console.error("Failed to clear cart successfully", error);
        }
      },

      getTotal: () =>
        get().cart.reduce((acc, item) => {
          let price = Number(item.basePrice || 0);
          if (item.selectedOptions) {
            price += item.selectedOptions.reduce(
              (sum: number, opt:any) => sum + Number(opt.price_impact || 0),
              0,
            );
          }
          return acc + price * item.quantity;
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
          const localCart = get().cart;
          const mergedCart = [...localCart];

          // 2. If server cart has items, merge them into local cart
          if (serverItems.length > 0) {
            for (const serverItem of serverItems) {
              const serverProdId = Number(serverItem.product?.id ?? serverItem.id);
              // Check if this item already exists locally
              const existingIndex = mergedCart.findIndex((local) => {
                if (Number(local.id) !== serverProdId) return false;
                return (
                  JSON.stringify(local.selectedOptions || []) ===
                  JSON.stringify(serverItem.selectedOptions || [])
                );
              });

              if (existingIndex === -1) {
                // Item doesn't exist locally — add it
                mergedCart.push({
                  id: serverProdId,
                  productId: serverProdId,
                  name: serverItem.product?.name || "Bespoke Garment Selection",
                  basePrice: String(Number(serverItem.unit_price) || 0),
                  imageUrl: serverItem.product?.image || "",
                  productType: serverItem.configuration ? "CUSTOM" : "STANDARD",
                  quantity: serverItem.qty,
                  selectedOptions: serverItem.selectedOptions || [],
                  configuration: serverItem.configuration || {},
                  totalPrice: String(Number(serverItem.total_price) || 0),
                });
              }
            }

            set({ cart: mergedCart });
          }

          // 3. Push local items to server that aren't already there
          if (get().cart.length > 0) {
            fetch("/api/cart", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ action: "sync", items: get().cart }),
            }).catch(() => {});
          }
        } catch (error) {
          console.error("Failed", error);
        }
      },

      /**
       * Push a single item to the server cart (fire-and-forget).
       */
      pushToServer: (item: CartItem) => {
        // only push to postgress if the user is logged in (session cookie exists)
        // Consider user logged in if session cookie exists
        const isLoggedIn = document.cookie.includes("Kinde_token");
        if (!isLoggedIn) return; //guest users don't have a server cart, so we skip the push

        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: item.id,
            qty: item.quantity,
            selectedOptions: item.selectedOptions || [],
            configuration: item.configuration || {},
            productType: item.productType,
          }),
        }).catch((err) => console.error("Fire-and-forget push failed", err));
      },

      /**
       * Remove item from server cart (fire-and-forget).
       */
      removeFromServer: (itemId: number, selectedOptions) => {
        const query = new URLSearchParams({ itemId: String(itemId) });
        if (selectedOptions) {
          query.append("optionsSnapshot", JSON.stringify(selectedOptions));
        }
        fetch(`/api/cart?${query.toString()}`, {
          method: "DELETE",
          credentials: "include",
        }).catch((err) => console.error("Fire-and-forget delete failed", err));
      },
    }),
    { name: "cart-storage" }, // persisted in localStorage
  ),
);
