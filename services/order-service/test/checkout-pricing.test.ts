import { beforeAll, describe, expect, it } from "vitest";
import {
  createCatalog,
  createPromotion,
  createUser,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import { db, eq, product } from "@repo/db";
import { quote } from "./helpers.js";

/**
 * POST /orders/quote prices a bag from the catalogue: multi-item totals,
 * shipping and VAT per destination, and coupon rules. Checkout displays
 * this quote and POST /orders charges the same calculation.
 */
let catalog: TestCatalog;
let shopper: TestUser;

beforeAll(async () => {
  catalog = await createCatalog();
  shopper = await createUser();
});

const suit = (extra: Record<string, unknown> = {}) => ({
  productId: catalog.suit.id,
  quantity: 1,
  ...extra,
});
const shirt = (quantity = 1) => ({ productId: catalog.shirt.id, quantity });

describe("multi-item pricing", () => {
  it("prices options from the catalogue and multiplies by quantity", async () => {
    const { status, body } = await quote(shopper, {
      items: [
        suit({ quantity: 2, selections: [catalog.options.peakLapel] }),
        shirt(3),
      ],
      country: "GB",
    });
    expect(status).toBe(200);
    // (50000 + 4000) * 2 + 5000 * 3
    expect(body.quote.subtotal).toBe(123000);
    expect(body.quote.lines).toEqual([
      expect.objectContaining({
        productId: catalog.suit.id,
        unitPrice: 54000,
        lineTotal: 108000,
      }),
      expect.objectContaining({
        productId: catalog.shirt.id,
        unitPrice: 5000,
        lineTotal: 15000,
      }),
    ]);
  });

  it("ignores unknown selections (they carry no price)", async () => {
    const { body } = await quote(shopper, {
      items: [suit({ selections: ["gold-plated-everything"] })],
      country: "GB",
    });
    expect(body.quote.subtotal).toBe(50000);
  });

  it("ignores prices sent by the client", async () => {
    const { body } = await quote(shopper, {
      items: [{ ...suit(), unitPrice: 1, price: 1 }],
      country: "GB",
    });
    expect(body.quote.subtotal).toBe(50000);
  });

  it("refuses products that are no longer on sale", async () => {
    await db
      .update(product)
      .set({ isActive: false })
      .where(eq(product.id, catalog.shirt.id));
    const { status, body } = await quote(shopper, {
      items: [shirt()],
      country: "GB",
    });
    await db
      .update(product)
      .set({ isActive: true })
      .where(eq(product.id, catalog.shirt.id));
    expect(status).toBe(409);
    expect(body.code).toBe("PRODUCT_UNAVAILABLE");
  });

  it("requires a signed-in shopper", async () => {
    const { app } = await import("./helpers.js");
    const res = await app.request("/orders/quote", {
      method: "POST",
      body: "{}",
    });
    expect(res.status).toBe(401);
  });
});

describe("shipping and tax per country", () => {
  it.each([
    // country, shipping, export VAT relief, VAT included, total — for one £50 shirt
    ["United Kingdom", 500, 0, 917, 5500],
    ["Germany", 1200, 833, 0, 5367],
    ["United States", 2000, 833, 0, 6167],
  ])("%s", async (country, shipping, relief, vat, total) => {
    const { body } = await quote(shopper, { items: [shirt()], country });
    expect(body.quote).toMatchObject({
      shipping,
      exportVatRelief: relief,
      vatIncluded: vat,
      total,
    });
  });

  it("ships free over £200", async () => {
    const { body } = await quote(shopper, { items: [suit()], country: "GB" });
    expect(body.quote.shipping).toBe(0);
  });

  it("refuses destinations we don't deliver to", async () => {
    const { status, body } = await quote(shopper, {
      items: [shirt()],
      country: "Narnia",
    });
    expect(status).toBe(409);
    expect(body.code).toBe("UNSUPPORTED_COUNTRY");
  });
});

describe("coupons", () => {
  it("applies a percentage coupon (case-insensitive code)", async () => {
    const promo = await createPromotion({ type: "percentage", percentOff: 10 });
    const { body } = await quote(shopper, {
      items: [suit()],
      country: "GB",
      promoCode: promo.code.toLowerCase(),
    });
    expect(body.promoError).toBeNull();
    expect(body.quote).toMatchObject({ discount: 5000, total: 45000 });
  });

  it("caps percentage coupons at their maximum discount", async () => {
    const promo = await createPromotion({
      type: "percentage",
      percentOff: 50,
      maxDiscountAmount: 7500,
    });
    const { body } = await quote(shopper, {
      items: [suit()],
      country: "GB",
      promoCode: promo.code,
    });
    expect(body.quote.discount).toBe(7500);
  });

  it("limits category coupons to matching items", async () => {
    const promo = await createPromotion({
      type: "percentage",
      percentOff: 20,
      categoryIds: [catalog.shirt.categoryId],
    });
    const both = await quote(shopper, {
      items: [suit(), shirt()],
      country: "GB",
      promoCode: promo.code,
    });
    expect(both.body.quote.discount).toBe(1000); // 20% of the £50 shirt only
    const suitOnly = await quote(shopper, {
      items: [suit()],
      country: "GB",
      promoCode: promo.code,
    });
    expect(suitOnly.body.promoError).toMatch(/doesn't apply/);
    expect(suitOnly.body.quote.discount).toBe(0);
  });

  it("enforces minimum order amounts", async () => {
    const promo = await createPromotion({
      type: "fixed_amount",
      amountOff: 1000,
      minOrderAmount: 10000,
    });
    const { body } = await quote(shopper, {
      items: [shirt()],
      country: "GB",
      promoCode: promo.code,
    });
    expect(body.promoError).toBe(
      "This promo code needs a minimum order of £100.00",
    );
  });

  it("rejects expired and unknown codes but still quotes the bag", async () => {
    const expired = await createPromotion({
      type: "percentage",
      percentOff: 10,
      expired: true,
    });
    const a = await quote(shopper, {
      items: [shirt()],
      country: "GB",
      promoCode: expired.code,
    });
    expect(a.body.promoError).toBe("This promo code has expired");
    const b = await quote(shopper, {
      items: [shirt()],
      country: "GB",
      promoCode: "NOPE",
    });
    expect(b.body.promoError).toBe("Invalid promo code");
    expect(b.body.quote.total).toBe(5500);
  });

  it("free-shipping coupons remove shipping", async () => {
    const promo = await createPromotion({ type: "free_shipping" });
    const { body } = await quote(shopper, {
      items: [shirt()],
      country: "United States",
      promoCode: promo.code,
    });
    expect(body.quote).toMatchObject({ shipping: 0, discount: 0 });
  });
});
