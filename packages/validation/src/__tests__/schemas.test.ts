import { describe, expect, it } from "vitest";
import {
  addToCartSchema,
  checkoutItemSchema,
  createCategorySchema,
  createCollectionSchema,
  createOrderSchema,
  createProductSchema,
  createPromotionSchema,
  measurementSchema,
  moneySchema,
  orderStatusSchema,
  quoteRequestSchema,
  refundRequestSchema,
  sanitizeString,
  shippingSchema,
  updateProductSchema,
  updateStockSchema,
  validateRequest,
} from "../index.js";

const errorsFor = (
  schema: Parameters<typeof validateRequest>[0],
  data: unknown,
) => {
  const result = validateRequest(schema, data);
  return result.success ? [] : result.errors;
};

const validShipping = {
  fullName: "Jo O'Neil-Smith",
  email: "jo@example.com",
  phone: "+44 (0)7700 900000",
  address: "1 Savile Row",
  city: "London",
  postalCode: "W1S 3PR",
  country: "United Kingdom",
};

describe("moneySchema (integer pence)", () => {
  it("accepts whole pence", () => {
    expect(moneySchema.parse(19900)).toBe(19900);
    expect(moneySchema.parse(0)).toBe(0);
  });

  it.each([[199.99], [-1], [100_000_000], [Number.NaN]])(
    "rejects %j",
    (value) => {
      expect(moneySchema.safeParse(value).success).toBe(false);
    },
  );

  it("explains the unit when given pounds", () => {
    expect(errorsFor(moneySchema, 499.99)[0]).toMatch(/whole pence/);
  });
});

describe("products", () => {
  const product = {
    name: "Navy Suit",
    slug: "navy-suit",
    categoryId: 1,
    fabricId: 1,
    basePrice: 49999,
  };

  it("accepts a valid product and applies defaults", () => {
    const parsed = createProductSchema.parse(product);
    expect(parsed).toMatchObject({
      productType: "CUSTOM",
      isActive: true,
      basePrice: 49999,
    });
  });

  it.each([
    [{ slug: "Navy Suit" }, "slug"],
    [{ basePrice: 499.99 }, "basePrice"],
    [{ categoryId: 0 }, "categoryId"],
    [{ initialStock: -1 }, "initialStock"],
    [{ mainImage: "not-a-url" }, "mainImage"],
  ])("rejects %j", (override, field) => {
    expect(
      errorsFor(createProductSchema, { ...product, ...override }).join(),
    ).toContain(field);
  });

  it("updates must change something and cannot set initial stock", () => {
    expect(errorsFor(updateProductSchema, {})).toHaveLength(1);
    expect(updateProductSchema.parse({ isActive: false })).toEqual({
      isActive: false,
    });
    expect(
      updateProductSchema.parse({ initialStock: 5, name: "x" }),
    ).not.toHaveProperty("initialStock");
  });

  it("stock updates are an absolute level or a non-zero delta", () => {
    expect(updateStockSchema.safeParse({ stock: 5 }).success).toBe(true);
    expect(updateStockSchema.safeParse({ delta: -2 }).success).toBe(true);
    expect(updateStockSchema.safeParse({ delta: 0 }).success).toBe(false);
    expect(updateStockSchema.safeParse({ stock: -3 }).success).toBe(false);
    expect(updateStockSchema.safeParse({ stock: 1.5 }).success).toBe(false);
  });

  it("categories and collections require slugs", () => {
    expect(
      createCategorySchema.safeParse({
        name: "Suits",
        slug: "suits",
        parentId: null,
      }).success,
    ).toBe(true);
    expect(
      createCollectionSchema.safeParse({ name: "Wedding", slug: "Wedding Day" })
        .success,
    ).toBe(false);
  });
});

describe("coupons (promotions)", () => {
  const base = {
    name: "Spring",
    code: "spring-10",
    startDate: "2026-01-01",
    endDate: "2026-02-01",
  };

  it("percentage coupons need percentOff within (0, 100]", () => {
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "percentage",
        percentOff: 12.5,
      }).success,
    ).toBe(true);
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "percentage",
        percentOff: 0,
      }).success,
    ).toBe(false);
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "percentage",
        percentOff: 101,
      }).success,
    ).toBe(false);
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "percentage",
        amountOff: 500,
      }).success,
    ).toBe(false);
  });

  it("fixed coupons need a positive amount in pence", () => {
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "fixed_amount",
        amountOff: 2500,
      }).success,
    ).toBe(true);
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "fixed_amount",
        amountOff: 25.5,
      }).success,
    ).toBe(false);
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "fixed_amount",
        amountOff: 0,
      }).success,
    ).toBe(false);
  });

  it("normalises the code and dates", () => {
    const parsed = createPromotionSchema.parse({
      ...base,
      type: "free_shipping",
    });
    expect(parsed.code).toBe("SPRING-10");
    expect(parsed.startDate).toBeInstanceOf(Date);
  });

  it("rejects an end date before the start date", () => {
    const result = createPromotionSchema.safeParse({
      ...base,
      type: "free_shipping",
      endDate: "2025-12-01",
    });
    expect(result.success).toBe(false);
  });

  it("minimum order amounts are pence", () => {
    expect(
      createPromotionSchema.safeParse({
        ...base,
        type: "free_shipping",
        minOrderAmount: 99.99,
      }).success,
    ).toBe(false);
  });
});

describe("addresses (shipping)", () => {
  it("accepts a typical UK address", () => {
    expect(shippingSchema.safeParse(validShipping).success).toBe(true);
  });

  it.each([
    [{ fullName: "" }, "fullName"],
    [{ fullName: "<script>" }, "fullName"],
    [{ email: "not-an-email" }, "email"],
    [{ phone: "call me" }, "phone"],
    [{ postalCode: "x".repeat(17) }, "postalCode"],
  ])("rejects %j", (override, field) => {
    expect(
      errorsFor(shippingSchema, { ...validShipping, ...override }).join(),
    ).toContain(field);
  });
});

describe("measurements", () => {
  const profile = {
    profileName: "Wedding",
    unit: "cm",
    height: 180,
    chest: 100,
    waist: 85,
    hips: 98,
    inseam: 82,
    shoulder: 46,
  };

  it("accepts a complete profile", () => {
    expect(measurementSchema.parse(profile)).toMatchObject({
      isDefault: false,
    });
  });

  it.each([
    [{ unit: "mm" }],
    [{ height: -1 }],
    [{ chest: 250 }],
    [{ profileName: "" }],
  ])("rejects %j", (override) => {
    expect(
      measurementSchema.safeParse({ ...profile, ...override }).success,
    ).toBe(false);
  });
});

describe("checkout", () => {
  const item = { productId: 1, quantity: 1 };

  it("items default to no selections and cap quantity", () => {
    expect(checkoutItemSchema.parse(item)).toEqual({ ...item, selections: [] });
    expect(
      checkoutItemSchema.safeParse({ ...item, quantity: 11 }).success,
    ).toBe(false);
    expect(checkoutItemSchema.safeParse({ ...item, quantity: 0 }).success).toBe(
      false,
    );
  });

  it("quotes need at least one item", () => {
    expect(
      quoteRequestSchema.safeParse({ items: [], country: "GB" }).success,
    ).toBe(false);
  });

  it("orders take the expected total in pence", () => {
    const order = { shipping: validShipping, items: [item] };
    expect(
      createOrderSchema.safeParse({ ...order, expectedTotal: 54049 }).success,
    ).toBe(true);
    expect(
      createOrderSchema.safeParse({ ...order, expectedTotal: 540.49 }).success,
    ).toBe(false);
  });

  it("legacy cart and refund schemas", () => {
    expect(addToCartSchema.parse({ productId: 1 })).toMatchObject({ qty: 1 });
    expect(
      refundRequestSchema.safeParse({ orderId: 1, reason: "wrong_size" })
        .success,
    ).toBe(true);
    expect(
      refundRequestSchema.safeParse({ orderId: 1, reason: "bored" }).success,
    ).toBe(false);
  });

  it("order statuses include the payment states", () => {
    expect(
      orderStatusSchema.safeParse({ status: "payment_review" }).success,
    ).toBe(true);
    expect(orderStatusSchema.safeParse({ status: "teleported" }).success).toBe(
      false,
    );
  });
});

describe("helpers", () => {
  it("validateRequest prefixes errors with the field path", () => {
    expect(errorsFor(shippingSchema, { ...validShipping, email: "x" })).toEqual(
      ["email: Invalid email address"],
    );
  });

  it("sanitizeString trims, strips angle brackets and collapses whitespace", () => {
    expect(sanitizeString("  <b>Hello</b>   world ")).toBe("bHello/b world");
  });
});
