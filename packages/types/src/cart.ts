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
