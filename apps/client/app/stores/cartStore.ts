import { create } from "zustand";
import {
  CartStoreActionType,
  CartStoreStateType,
  CartItemType,
} from "../lib/types";
import { persist, createJSONStorage } from "zustand/middleware";

const useCartStore = create<CartStoreStateType & CartStoreActionType>()(
  persist(
    (set) => ({
      cart: [],
      hasHydrated: false,
      addToCart: (product: CartItemType) =>
        set((state) => {
          const existingProduct = state.cart.find(
            (p) =>
              p.id === product.id &&
              p.selectedSize === product.selectedSize &&
              p.selectedColor === product.selectedColor,
          );

          if (existingProduct) {
            const updatedCart = [...state.cart];
            const index = updatedCart.indexOf(existingProduct);
            updatedCart[index].quantity += product.quantity || 1;
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, product] };
        }),

      removeFromCart: (product: CartItemType) =>
        set((state) => ({
          cart: state.cart.filter(
            (p) =>
              p.id !== product?.id &&
              p.selectedSize !== product.selectedSize &&
              p.selectedColor !== product.selectedColor,
          ),
        })),
      updateCartItem: (productId: number, updatedItem: Partial<CartItemType>) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, ...updatedItem } : item,
          ),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage:
        () =>
        (state: (CartStoreStateType & CartStoreActionType) | undefined) => {
          if (state) {
            state.hasHydrated = true;
          }
        },
    },
  ),
);

export default useCartStore;
