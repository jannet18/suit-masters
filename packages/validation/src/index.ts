import { z } from "zod";

// ─── Checkout / Shipping ─────────────────────────────────────────────────────

export const shippingSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(255, "Full name must be under 255 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Full name contains invalid characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be under 255 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(32, "Phone must be under 32 characters")
    .regex(/^[\+]?[\d\s\-\(\)]+$/, "Phone number contains invalid characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be under 255 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(128, "City must be under 128 characters"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(16, "Postal code must be under 16 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(64, "Country must be under 64 characters"),
  addressLine2: z
    .string()
    .max(255, "Address line 2 must be under 255 characters")
    .optional()
    .or(z.literal("")),
  region: z
    .string()
    .max(128, "Region must be under 128 characters")
    .optional()
    .or(z.literal("")),
});

export type ShippingData = z.infer<typeof shippingSchema>;

// ─── Order Creation ──────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  shipping: shippingSchema,
  cartItems: z
    .array(z.any())
    .min(1, "Cart must have at least one item"),
  totalAmount: z
    .number()
    .positive("Total amount must be positive")
    .max(999999.99, "Total amount exceeds maximum"),
});

// ─── Order Status Update ─────────────────────────────────────────────────────

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "in_production",
    "quality_check",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingNumber: z
    .string()
    .max(128, "Tracking number must be under 128 characters")
    .optional()
    .or(z.literal("")),
  trackingCarrier: z
    .string()
    .max(64, "Carrier must be under 64 characters")
    .optional()
    .or(z.literal("")),
});

// ─── Refund Request ──────────────────────────────────────────────────────────

export const refundRequestSchema = z.object({
  orderId: z
    .number()
    .int("Order ID must be an integer")
    .positive("Order ID must be positive"),
  reason: z.enum([
    "wrong_size",
    "defective",
    "not_as_described",
    "changed_mind",
    "late_delivery",
    "other",
  ]),
  description: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional()
    .or(z.literal("")),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive")
    .max(100, "Quantity exceeds maximum")
    .optional()
    .default(1),
});

// ─── Profile Update ──────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .max(255, "Name must be under 255 characters")
    .regex(/^[a-zA-Z\s\-'.]*$/, "Name contains invalid characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(32, "Phone must be under 32 characters")
    .regex(/^[\+]?[\d\s\-\(\)]*$/, "Phone number contains invalid characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "Address must be under 500 characters")
    .optional()
    .or(z.literal("")),
});

// ─── Measurement Profile ─────────────────────────────────────────────────────

export const measurementSchema = z.object({
  profileName: z
    .string()
    .min(1, "Profile name is required")
    .max(64, "Profile name must be under 64 characters"),
  unit: z.enum(["cm", "in"]),
  height: z
    .number()
    .min(0, "Height must be positive")
    .max(300, "Height exceeds maximum"),
  chest: z
    .number()
    .min(0, "Chest must be positive")
    .max(200, "Chest exceeds maximum"),
  waist: z
    .number()
    .min(0, "Waist must be positive")
    .max(200, "Waist exceeds maximum"),
  hips: z
    .number()
    .min(0, "Hips must be positive")
    .max(200, "Hips exceeds maximum"),
  inseam: z
    .number()
    .min(0, "Inseam must be positive")
    .max(200, "Inseam exceeds maximum"),
  shoulder: z
    .number()
    .min(0, "Shoulder must be positive")
    .max(200, "Shoulder exceeds maximum"),
  isDefault: z.boolean().optional().default(false),
});

// ─── Product Configuration ───────────────────────────────────────────────────

export const productConfigSchema = z.object({
  productId: z
    .number()
    .int("Product ID must be an integer")
    .positive("Product ID must be positive"),
  selections: z.record(
    z.string(),
    z.number().int().positive("Selection ID must be positive"),
  ),
});

// ─── Cart Operations ─────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z
    .number()
    .int("Product ID must be an integer")
    .positive("Product ID must be positive"),
  configurationId: z
    .string()
    .optional()
    .or(z.literal("")),
  measurementId: z
    .string()
    .optional()
    .or(z.literal("")),
  qty: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive")
    .max(100, "Quantity exceeds maximum")
    .default(1),
});

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(2, "Search query must be at least 2 characters")
    .max(100, "Search query must be under 100 characters")
    .regex(/^[a-zA-Z0-9\s\-'.]+$/, "Search query contains invalid characters"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(5),
});

// ─── Validation Helper ───────────────────────────────────────────────────────

/**
 * Validate a request body against a Zod schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(
    (issue: any) => `${issue.path.join(".")}: ${issue.message}`,
  );

  return { success: false, errors };
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

/**
 * Sanitize a string by trimming whitespace and removing potentially dangerous characters.
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets (basic XSS prevention)
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === "string") {
      (sanitized as any)[key] = sanitizeString(sanitized[key]);
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      (sanitized as any)[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized;
}