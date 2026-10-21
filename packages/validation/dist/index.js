import { z } from "zod";
/**
 * Money in API payloads is an integer number of minor units (pence):
 * £199.00 is 19900. Convert user input with toMinorUnits() from @repo/pricing.
 */
export const moneySchema = z
    .number()
    .int("Amounts must be whole pence (e.g. 19900 for £199.00)")
    .nonnegative("Amount cannot be negative")
    .max(99_999_999, "Amount exceeds maximum");
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
    // ISO code or name; order-service checks it against the countries we ship to
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
// ─── Checkout ────────────────────────────────────────────────────────────────
// The client sends only what the shopper chose; order-service prices every
// line from the catalogue, so client-side prices are never trusted.
export const checkoutItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z
        .number()
        .int()
        .min(1, "Quantity must be at least 1")
        .max(10, "Maximum 10 per item"),
    /** Chosen customisation values (e.g. "peak-lapel"); unknown values are kept as notes, unpriced. */
    selections: z.array(z.string().min(1).max(128)).max(20).default([]),
    size: z.string().max(16).optional(),
    measurements: z
        .record(z.string(), z.union([z.number(), z.string().max(16)]))
        .optional(),
});
const promoCodeSchema = z.string().trim().max(64).optional().or(z.literal(""));
export const quoteRequestSchema = z.object({
    items: z.array(checkoutItemSchema).min(1, "Your bag is empty").max(50),
    country: z.string().min(2).max(64),
    promoCode: promoCodeSchema,
});
export const createOrderSchema = z.object({
    shipping: shippingSchema,
    items: z.array(checkoutItemSchema).min(1, "Your bag is empty").max(50),
    promoCode: promoCodeSchema,
    /** Total the shopper was shown (pence); the order is refused if it changed. */
    expectedTotal: moneySchema.optional(),
});
// ─── Order Status Update ─────────────────────────────────────────────────────
export const orderStatusSchema = z.object({
    status: z.enum([
        "pending",
        "payment_failed",
        "payment_review",
        "paid",
        "confirmed",
        "processing",
        "in_production",
        "quality_check",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "disputed",
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
    selections: z.record(z.string(), z.number().int().positive("Selection ID must be positive")),
});
// ─── Cart Operations ─────────────────────────────────────────────────────────
export const addToCartSchema = z.object({
    productId: z
        .number()
        .int("Product ID must be an integer")
        .positive("Product ID must be positive"),
    configurationId: z.string().optional().or(z.literal("")),
    measurementId: z.string().optional().or(z.literal("")),
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
    limit: z.number().int().min(1).max(50).optional().default(5),
});
// ─── Catalog Management (admin) ──────────────────────────────────────────────
const slugSchema = z
    .string()
    .min(1, "Slug is required")
    .max(128, "Slug must be under 128 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens");
const priceSchema = moneySchema;
const stockSchema = z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000, "Stock exceeds maximum");
const imageUrlSchema = z
    .string()
    .url("Image must be a valid URL")
    .max(255, "Image URL must be under 255 characters");
export const createProductSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(128, "Name must be under 128 characters"),
    slug: slugSchema,
    categoryId: z.number().int().positive("Category is required"),
    fabricId: z.number().int().positive("Fabric is required"),
    productType: z.enum(["STANDARD", "CUSTOM"]).default("CUSTOM"),
    basePrice: priceSchema,
    description: z.string().max(5000).optional(),
    mainImage: imageUrlSchema.optional().or(z.literal("")),
    productImage: imageUrlSchema.optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    collectionIds: z.array(z.number().int().positive()).optional(),
    // Creates a default SKU holding this stock. Omit for made-to-order products,
    // which are not stock-limited.
    initialStock: stockSchema.optional(),
});
export const updateProductSchema = createProductSchema
    .omit({ initialStock: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, "No fields to update");
export const updateStockSchema = z.union([
    // Set an absolute stock level
    z.object({
        productItemId: z.number().int().positive().optional(),
        stock: stockSchema,
    }),
    // Adjust stock relative to the current level (e.g. +5 received, -2 damaged)
    z.object({
        productItemId: z.number().int().positive().optional(),
        delta: z
            .number()
            .int("Adjustment must be a whole number")
            .refine((n) => n !== 0, "Adjustment cannot be zero"),
    }),
]);
export const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(128, "Name must be under 128 characters"),
    slug: slugSchema,
    parentId: z.number().int().positive().nullable().optional(),
});
export const updateCategorySchema = createCategorySchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, "No fields to update");
export const createCollectionSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(128, "Name must be under 128 characters"),
    slug: slugSchema,
    description: z
        .string()
        .max(255, "Description must be under 255 characters")
        .optional(),
    image: imageUrlSchema.optional().or(z.literal("")),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
    productIds: z.array(z.number().int().positive()).optional(),
});
export const updateCollectionSchema = createCollectionSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, "No fields to update");
const promotionBaseSchema = z.object({
    name: z.string().min(1, "Name is required").max(128),
    code: z
        .string()
        .min(3, "Code must be at least 3 characters")
        .max(64)
        .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only")
        .transform((c) => c.toUpperCase()),
    description: z.string().max(255).optional(),
    minOrderAmount: moneySchema.nullable().optional(),
    maxDiscountAmount: moneySchema.nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().nullable().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isActive: z.boolean().optional(),
    categoryIds: z.array(z.number().int().positive()).optional(),
});
/** Discount is either a percentage or a fixed amount in pence, never both. */
export const createPromotionSchema = z
    .discriminatedUnion("type", [
    promotionBaseSchema.extend({
        type: z.literal("percentage"),
        percentOff: z
            .number()
            .gt(0, "Must be above 0%")
            .max(100, "Cannot exceed 100%"),
    }),
    promotionBaseSchema.extend({
        type: z.literal("fixed_amount"),
        amountOff: moneySchema.refine((v) => v > 0, "Must be above £0"),
    }),
    promotionBaseSchema.extend({ type: z.literal("free_shipping") }),
])
    .refine((p) => p.endDate > p.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
});
// ─── Validation Helper ───────────────────────────────────────────────────────
/**
 * Validate a request body against a Zod schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validateRequest(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errors = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return { success: false, errors };
}
// ─── Input Sanitization ──────────────────────────────────────────────────────
/**
 * Sanitize a string by trimming whitespace and removing potentially dangerous characters.
 */
export function sanitizeString(input) {
    return input
        .trim()
        .replace(/[<>]/g, "") // Remove angle brackets (basic XSS prevention)
        .replace(/\s+/g, " "); // Normalize whitespace
}
/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject(obj) {
    const sanitized = { ...obj };
    for (const key of Object.keys(sanitized)) {
        if (typeof sanitized[key] === "string") {
            sanitized[key] = sanitizeString(sanitized[key]);
        }
        else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }
    return sanitized;
}
