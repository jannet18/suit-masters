import { z } from "zod";
/**
 * Money in API payloads is an integer number of minor units (pence):
 * £199.00 is 19900. Convert user input with toMinorUnits() from @repo/pricing.
 */
export declare const moneySchema: z.ZodNumber;
export declare const shippingSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
    addressLine2: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    region: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    addressLine2?: string | undefined;
    region?: string | undefined;
}, {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    addressLine2?: string | undefined;
    region?: string | undefined;
}>;
export type ShippingData = z.infer<typeof shippingSchema>;
export declare const checkoutItemSchema: z.ZodObject<{
    productId: z.ZodNumber;
    quantity: z.ZodNumber;
    /** Chosen customisation values (e.g. "peak-lapel"); unknown values are kept as notes, unpriced. */
    selections: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    size: z.ZodOptional<z.ZodString>;
    measurements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
}, "strip", z.ZodTypeAny, {
    productId: number;
    quantity: number;
    selections: string[];
    size?: string | undefined;
    measurements?: Record<string, string | number> | undefined;
}, {
    productId: number;
    quantity: number;
    selections?: string[] | undefined;
    size?: string | undefined;
    measurements?: Record<string, string | number> | undefined;
}>;
export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export declare const quoteRequestSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
        /** Chosen customisation values (e.g. "peak-lapel"); unknown values are kept as notes, unpriced. */
        selections: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        size: z.ZodOptional<z.ZodString>;
        measurements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    }, "strip", z.ZodTypeAny, {
        productId: number;
        quantity: number;
        selections: string[];
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }, {
        productId: number;
        quantity: number;
        selections?: string[] | undefined;
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }>, "many">;
    country: z.ZodString;
    promoCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    country: string;
    items: {
        productId: number;
        quantity: number;
        selections: string[];
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }[];
    promoCode?: string | undefined;
}, {
    country: string;
    items: {
        productId: number;
        quantity: number;
        selections?: string[] | undefined;
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }[];
    promoCode?: string | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    shipping: z.ZodObject<{
        fullName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        address: z.ZodString;
        city: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        addressLine2: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        region: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        addressLine2?: string | undefined;
        region?: string | undefined;
    }, {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        addressLine2?: string | undefined;
        region?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
        /** Chosen customisation values (e.g. "peak-lapel"); unknown values are kept as notes, unpriced. */
        selections: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        size: z.ZodOptional<z.ZodString>;
        measurements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString]>>>;
    }, "strip", z.ZodTypeAny, {
        productId: number;
        quantity: number;
        selections: string[];
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }, {
        productId: number;
        quantity: number;
        selections?: string[] | undefined;
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }>, "many">;
    promoCode: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    /** Total the shopper was shown (pence); the order is refused if it changed. */
    expectedTotal: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: number;
        quantity: number;
        selections: string[];
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }[];
    shipping: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        addressLine2?: string | undefined;
        region?: string | undefined;
    };
    promoCode?: string | undefined;
    expectedTotal?: number | undefined;
}, {
    items: {
        productId: number;
        quantity: number;
        selections?: string[] | undefined;
        size?: string | undefined;
        measurements?: Record<string, string | number> | undefined;
    }[];
    shipping: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        addressLine2?: string | undefined;
        region?: string | undefined;
    };
    promoCode?: string | undefined;
    expectedTotal?: number | undefined;
}>;
export declare const orderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "payment_failed", "payment_review", "paid", "confirmed", "processing", "in_production", "quality_check", "shipped", "delivered", "cancelled", "refunded", "disputed"]>;
    trackingNumber: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    trackingCarrier: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "payment_failed" | "payment_review" | "paid" | "confirmed" | "processing" | "in_production" | "quality_check" | "shipped" | "delivered" | "cancelled" | "refunded" | "disputed";
    trackingNumber?: string | undefined;
    trackingCarrier?: string | undefined;
}, {
    status: "pending" | "payment_failed" | "payment_review" | "paid" | "confirmed" | "processing" | "in_production" | "quality_check" | "shipped" | "delivered" | "cancelled" | "refunded" | "disputed";
    trackingNumber?: string | undefined;
    trackingCarrier?: string | undefined;
}>;
export declare const refundRequestSchema: z.ZodObject<{
    orderId: z.ZodNumber;
    reason: z.ZodEnum<["wrong_size", "defective", "not_as_described", "changed_mind", "late_delivery", "other"]>;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    quantity: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    orderId: number;
    reason: "wrong_size" | "defective" | "not_as_described" | "changed_mind" | "late_delivery" | "other";
    description?: string | undefined;
}, {
    orderId: number;
    reason: "wrong_size" | "defective" | "not_as_described" | "changed_mind" | "late_delivery" | "other";
    quantity?: number | undefined;
    description?: string | undefined;
}>;
export declare const profileUpdateSchema: z.ZodObject<{
    name: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    address?: string | undefined;
    name?: string | undefined;
}, {
    phone?: string | undefined;
    address?: string | undefined;
    name?: string | undefined;
}>;
export declare const measurementSchema: z.ZodObject<{
    profileName: z.ZodString;
    unit: z.ZodEnum<["cm", "in"]>;
    height: z.ZodNumber;
    chest: z.ZodNumber;
    waist: z.ZodNumber;
    hips: z.ZodNumber;
    inseam: z.ZodNumber;
    shoulder: z.ZodNumber;
    isDefault: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    profileName: string;
    unit: "cm" | "in";
    height: number;
    chest: number;
    waist: number;
    hips: number;
    inseam: number;
    shoulder: number;
    isDefault: boolean;
}, {
    profileName: string;
    unit: "cm" | "in";
    height: number;
    chest: number;
    waist: number;
    hips: number;
    inseam: number;
    shoulder: number;
    isDefault?: boolean | undefined;
}>;
export declare const productConfigSchema: z.ZodObject<{
    productId: z.ZodNumber;
    selections: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    productId: number;
    selections: Record<string, number>;
}, {
    productId: number;
    selections: Record<string, number>;
}>;
export declare const addToCartSchema: z.ZodObject<{
    productId: z.ZodNumber;
    configurationId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    measurementId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    qty: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    productId: number;
    qty: number;
    configurationId?: string | undefined;
    measurementId?: string | undefined;
}, {
    productId: number;
    configurationId?: string | undefined;
    measurementId?: string | undefined;
    qty?: number | undefined;
}>;
export declare const searchQuerySchema: z.ZodObject<{
    q: z.ZodString;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    q: string;
    limit: number;
}, {
    q: string;
    limit?: number | undefined;
}>;
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    categoryId: z.ZodNumber;
    fabricId: z.ZodNumber;
    productType: z.ZodDefault<z.ZodEnum<["STANDARD", "CUSTOM"]>>;
    basePrice: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    mainImage: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    productImage: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    collectionIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    initialStock: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    categoryId: number;
    fabricId: number;
    productType: "STANDARD" | "CUSTOM";
    basePrice: number;
    isActive: boolean;
    description?: string | undefined;
    mainImage?: string | undefined;
    productImage?: string | undefined;
    collectionIds?: number[] | undefined;
    initialStock?: number | undefined;
}, {
    name: string;
    slug: string;
    categoryId: number;
    fabricId: number;
    basePrice: number;
    description?: string | undefined;
    productType?: "STANDARD" | "CUSTOM" | undefined;
    mainImage?: string | undefined;
    productImage?: string | undefined;
    isActive?: boolean | undefined;
    collectionIds?: number[] | undefined;
    initialStock?: number | undefined;
}>;
export declare const updateProductSchema: z.ZodEffects<z.ZodObject<{
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    fabricId: z.ZodOptional<z.ZodNumber>;
    productType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["STANDARD", "CUSTOM"]>>>;
    basePrice: z.ZodOptional<z.ZodNumber>;
    mainImage: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    productImage: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    collectionIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    categoryId?: number | undefined;
    fabricId?: number | undefined;
    productType?: "STANDARD" | "CUSTOM" | undefined;
    basePrice?: number | undefined;
    mainImage?: string | undefined;
    productImage?: string | undefined;
    isActive?: boolean | undefined;
    collectionIds?: number[] | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    categoryId?: number | undefined;
    fabricId?: number | undefined;
    productType?: "STANDARD" | "CUSTOM" | undefined;
    basePrice?: number | undefined;
    mainImage?: string | undefined;
    productImage?: string | undefined;
    isActive?: boolean | undefined;
    collectionIds?: number[] | undefined;
}>, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    categoryId?: number | undefined;
    fabricId?: number | undefined;
    productType?: "STANDARD" | "CUSTOM" | undefined;
    basePrice?: number | undefined;
    mainImage?: string | undefined;
    productImage?: string | undefined;
    isActive?: boolean | undefined;
    collectionIds?: number[] | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    categoryId?: number | undefined;
    fabricId?: number | undefined;
    productType?: "STANDARD" | "CUSTOM" | undefined;
    basePrice?: number | undefined;
    mainImage?: string | undefined;
    productImage?: string | undefined;
    isActive?: boolean | undefined;
    collectionIds?: number[] | undefined;
}>;
export declare const updateStockSchema: z.ZodUnion<[z.ZodObject<{
    productItemId: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    stock: number;
    productItemId?: number | undefined;
}, {
    stock: number;
    productItemId?: number | undefined;
}>, z.ZodObject<{
    productItemId: z.ZodOptional<z.ZodNumber>;
    delta: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    delta: number;
    productItemId?: number | undefined;
}, {
    delta: number;
    productItemId?: number | undefined;
}>]>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    parentId?: number | null | undefined;
}, {
    name: string;
    slug: string;
    parentId?: number | null | undefined;
}>;
export declare const updateCategorySchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    slug?: string | undefined;
    parentId?: number | null | undefined;
}, {
    name?: string | undefined;
    slug?: string | undefined;
    parentId?: number | null | undefined;
}>, {
    name?: string | undefined;
    slug?: string | undefined;
    parentId?: number | null | undefined;
}, {
    name?: string | undefined;
    slug?: string | undefined;
    parentId?: number | null | undefined;
}>;
export declare const createCollectionSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    productIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    image?: string | undefined;
    sortOrder?: number | undefined;
    productIds?: number[] | undefined;
}, {
    name: string;
    slug: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    image?: string | undefined;
    sortOrder?: number | undefined;
    productIds?: number[] | undefined;
}>;
export declare const updateCollectionSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    image: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    isActive: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    sortOrder: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    productIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    isActive?: boolean | undefined;
    image?: string | undefined;
    sortOrder?: number | undefined;
    productIds?: number[] | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    isActive?: boolean | undefined;
    image?: string | undefined;
    sortOrder?: number | undefined;
    productIds?: number[] | undefined;
}>, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    isActive?: boolean | undefined;
    image?: string | undefined;
    sortOrder?: number | undefined;
    productIds?: number[] | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
    slug?: string | undefined;
    isActive?: boolean | undefined;
    image?: string | undefined;
    sortOrder?: number | undefined;
    productIds?: number[] | undefined;
}>;
/** Discount is either a percentage or a fixed amount in pence, never both. */
export declare const createPromotionSchema: z.ZodEffects<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    name: z.ZodString;
    code: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodString>;
    minOrderAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxDiscountAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    usageLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perUserLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    isActive: z.ZodOptional<z.ZodBoolean>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
} & {
    type: z.ZodLiteral<"percentage">;
    percentOff: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "percentage";
    name: string;
    startDate: Date;
    endDate: Date;
    percentOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}, {
    code: string;
    type: "percentage";
    name: string;
    startDate: Date;
    endDate: Date;
    percentOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
    code: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodString>;
    minOrderAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxDiscountAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    usageLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perUserLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    isActive: z.ZodOptional<z.ZodBoolean>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
} & {
    type: z.ZodLiteral<"fixed_amount">;
    amountOff: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "fixed_amount";
    name: string;
    startDate: Date;
    endDate: Date;
    amountOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}, {
    code: string;
    type: "fixed_amount";
    name: string;
    startDate: Date;
    endDate: Date;
    amountOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
    code: z.ZodEffects<z.ZodString, string, string>;
    description: z.ZodOptional<z.ZodString>;
    minOrderAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxDiscountAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    usageLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perUserLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    isActive: z.ZodOptional<z.ZodBoolean>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
} & {
    type: z.ZodLiteral<"free_shipping">;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: "free_shipping";
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}, {
    code: string;
    type: "free_shipping";
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}>]>, {
    code: string;
    type: "percentage";
    name: string;
    startDate: Date;
    endDate: Date;
    percentOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
} | {
    code: string;
    type: "fixed_amount";
    name: string;
    startDate: Date;
    endDate: Date;
    amountOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
} | {
    code: string;
    type: "free_shipping";
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}, {
    code: string;
    type: "percentage";
    name: string;
    startDate: Date;
    endDate: Date;
    percentOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
} | {
    code: string;
    type: "fixed_amount";
    name: string;
    startDate: Date;
    endDate: Date;
    amountOff: number;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
} | {
    code: string;
    type: "free_shipping";
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    isActive?: boolean | undefined;
    minOrderAmount?: number | null | undefined;
    maxDiscountAmount?: number | null | undefined;
    usageLimit?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    categoryIds?: number[] | undefined;
}>;
export type CreatePromotionInput = z.input<typeof createPromotionSchema>;
export type PromotionData = z.output<typeof createPromotionSchema>;
export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
export type UpdateStockInput = z.input<typeof updateStockSchema>;
export type CreateCategoryInput = z.input<typeof createCategorySchema>;
export type UpdateCategoryInput = z.input<typeof updateCategorySchema>;
export type CreateCollectionInput = z.input<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.input<typeof updateCollectionSchema>;
/**
 * Validate a request body against a Zod schema.
 * Returns { success: true, data } or { success: false, errors }.
 */
export declare function validateRequest<T extends z.ZodType>(schema: T, data: unknown): {
    success: true;
    data: z.infer<T>;
} | {
    success: false;
    errors: string[];
};
/**
 * Sanitize a string by trimming whitespace and removing potentially dangerous characters.
 */
export declare function sanitizeString(input: string): string;
/**
 * Sanitize an object's string values recursively.
 */
export declare function sanitizeObject<T extends Record<string, any>>(obj: T): T;
//# sourceMappingURL=index.d.ts.map