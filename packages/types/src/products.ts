import { z } from "zod";

/* ----------------------------
   Create Product Configuration
----------------------------- */

export const CreateProductConfigurationRequest = z.object({
  product_id: z.number(),
  selected_options: z.record(z.string(), z.number()),
});

export const CreateProductConfigurationResponse = z.object({
  configuration_id: z.string().uuid(),
  final_price: z.number(),
});

export type CreateProductConfigurationRequest = z.infer<
  typeof CreateProductConfigurationRequest
>;

export type CreateProductConfigurationResponse = z.infer<
  typeof CreateProductConfigurationResponse
>;
