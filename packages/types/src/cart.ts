// // import type { Product } from "@repo/product-db";
// import z from "zod";

// export type CartItemType = Product & {
//   quantity: number;
//   selectedSize: string;
//   selectedColor: string;
// };

// export type CartItemsType = CartItemType[];

// export const shippingFormSchema = z.object({
//   name: z.string().min(1, "Name is required!"),
//   email: z
//     .string()
//     .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format")
//     .min(1, "Email is required!"),
//   phone: z
//     .string()
//     .min(7, "Phone number must be between 7 and 10 digits!")
//     .max(10, "Phone number must be between 7 and 10 digits!")
//     .regex(/^\d+$/, "Phone number must contain only numbers!"),
//   address: z.string().min(1, "Address is required!"),
//   city: z.string().min(1, "City is required!"),
// });

// export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

// export type CartStoreStateType = {
//   cart: CartItemsType;
//   hasHydrated: boolean;
// };

// export type CartStoreActionsType = {
//   addToCart: (product: CartItemType) => void;
//   removeFromCart: (product: CartItemType) => void;
//   clearCart: () => void;
// };

import { z } from "zod";

/* Add item to cart */
export const AddToCartRequest = z.object({
  product_item_id: z.number(),
  configuration_id: z.string().uuid().nullable(),
  measurement_id: z.string().uuid().nullable().optional(),
  qty: z.number().min(1),
});

export const AddToCartResponse = z.object({
  success: z.boolean(),
});

/* Get cart */
export const CartItem = z.object({
  id: z.number(),
  product: z.object({
    name: z.string(),
    image: z.string(),
  }),
  configuration: z.record(z.string(), z.any()).nullable(),
  qty: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
});

export const GetCartResponse = z.object({
  cart_id: z.number().nullable(),
  items: z.array(CartItem),
  cart_total: z.number(),
});

export type AddToCartRequest = z.infer<typeof AddToCartRequest>;
export type AddToCartResponse = z.infer<typeof AddToCartResponse>;
export type GetCartResponse = z.infer<typeof GetCartResponse>;
