import { z } from "zod";

/* Checkout */
export const CheckoutResponse = z.object({
  order_id: z.number(),
  total: z.number(),
  message: z.string(),
});

/* List orders */
export const OrderSummary = z.object({
  id: z.number(),
  total: z.number(),
  order_date: z.string(),
  status: z.string(),
});

export const GetOrdersResponse = z.array(OrderSummary);

export type CheckoutResponse = z.infer<typeof CheckoutResponse>;
export type GetOrdersResponse = z.infer<typeof GetOrdersResponse>;
