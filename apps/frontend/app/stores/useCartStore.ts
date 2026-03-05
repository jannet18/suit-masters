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
      clearCart: () => set({ cart: [] }),

      getTotal: () =>
        get().cart.reduce((acc, item) => {
          let price = Number(item.base_price);
          if (item.selected_options) {
            price += item.selected_options.reduce(
              (sum, opt) => sum + Number(opt.price_impact),
              0,
            );
          }
          return (acc + price * item.quantity) / 100;
        }, 0),
    }),
    { name: "cart-storage" }, // persisted in localStorage
  ),
);
