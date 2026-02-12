import { z } from "zod";
//  SHIPPING FORM

export const shippingFormSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(3, "ZIP code is required"),
});

export type ShippingFormData = z.infer<typeof shippingFormSchema>;

//  PAYMENT FORM (Optional future)

export const paymentFormSchema = z.object({
  cardName: z.string().min(2, "Name on card required"),
  cardNumber: z.string().min(12, "Invalid card number"),
  expiry: z.string().min(4, "Expiry required"),
  cvv: z.string().min(3, "CVV required"),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;
