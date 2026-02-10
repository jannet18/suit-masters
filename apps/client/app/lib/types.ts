// export type SuitVisualizerProps = {
//   selectedOptions: {
//     style?: string;
//     lapel?: string;
//     fabric?: {
//       pattern?: string;
//       color?: string;
//     };
//     monogram?: string;
//   };
// };
// type SelectedOptions = {
//   style: string;
//   lapel: string;
//   fabric?: {
//     pattern?: string;
//     color?: string;
//   };
//   monogram?: string;
// };

import z from "zod";

// type SuitVisualizerProps = {
//   selectedOptions: SelectedOptions;
// };

// export type { SelectedOptions, SuitVisualizerProps };
// export type StyleOption = "singlle-breasted" | "double-breasted";
// export type LapelOption = "notch" | "peak";

// export type FabricOption = {
//   id?: string;
//   name?: string;
//   pattern?: string;
//   color?: string;
//   premium?: boolean;
//   priceModifier?: number;
// };

// export type SelectedOptions = {
//   fabric: FabricOption | null;
//   style: string;
//   lapel: string;
//   buttons: string;
//   vents: string;
//   pockets: string;
//   lining: string;
//   monogram: string;
// };

// export type SuitVisualizerProps = {
//   selectedOptions: SelectedOptions;
// };

// export type CustomizationOptsProps = {
//   step: { id: string; [key: string]: any };
//   selectedOptions: Record<string, any>;
//   handleSelect: (category: string, value: string) => void;
// };

export type StepKey =
  | "fabric"
  | "style"
  | "details"
  | "measurements"
  | "review"
  | "monogram";

export interface Step {
  id: StepKey;
  name: string;
  options: Array<{ id: string; name: string; [key: string]: any }>;
}

export interface FabricOpts {
  id: string;
  name: string;
  pattern?: string | null;
  color: string;
  premium: boolean;
  priceModifier?: number;
}

export interface SelectedOptions {
  fabric?: FabricOpts | null;
  style: string;
  lapel: string;
  buttons?: string;
  vents: string;
  pockets: string;
  lining: string;
  monogram: string;
}

export type OptionChangeHandler = (
  category: keyof SelectedOptions,
  value: any,
) => void;

export interface Product {
  id: number | string;
  name: string;
  image: { default: string } & Record<string, string>;
  price: number;
  sizes: string[];
  colors: string[];
  originalPrice: number;
  discount: number;
  sku: string;
  rating: number;
  delivery: string;
  category: string;
  description?: string;
}
// export type CartItemType = Product & {
//   id: number | string; // Changed to string to support unique temporary IDs
//   quantity: number;
//   selectedSize: string;
//   selectedColor: string;
// };
// @/app/lib/types.ts
export type CartItemType = {
  id: number | string; // Changed to string to support unique temporary IDs
  productId: number; // The base suit product ID
  name: string;
  price: number;
  quantity: number;
  image: string;
  // This holds all the bespoke details
  customization: SelectedOptions;
};

export type cartItemsType = CartItemType[];

export const shippingFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Email address is required"),
  phone: z
    .string()
    .min(7, "Phone number must be between 7 and 10 digits ")
    .max(10, "Phone number must be between 7 and 10 digits ")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
});

export type ShippingFormData = z.infer<typeof shippingFormSchema>;

export const paymentFormSchema = z.object({
  cardName: z.string().min(2, "Name on card is required"),
  cardNumber: z
    .string()
    .length(16, "Card number must be 16 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  expiryDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
      "Expiry date must be in MM/YY format",
    ),
  cvv: z
    .string()
    .length(3, "CVV must be 3 digits")
    .regex(/^\d+$/, "CVV must contain only digits"),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

export type CartStoreStateType = {
  cart: CartItemType[];
  hasHydrated: boolean;
};

export type CartStoreActionType = {
  addToCart: (product: CartItemType) => void;
  removeFromCart: (product: CartItemType) => void;
  updateCartItem: (
    productId: number,
    updatedItem: Partial<CartItemType>,
  ) => void;
  clearCart: () => void;
};
