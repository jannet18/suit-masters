import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createCatalog,
  createPromotion,
  createUser,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import { db, eq, userMeasurements, promotionTable } from "@repo/db";
import {
  idempotencyKey,
  orderRow,
  placeOrder,
  quote,
  setStock,
  stockOf,
} from "./helpers.js";

let catalog: TestCatalog;
let shopper: TestUser;

beforeAll(async () => {
  catalog = await createCatalog({ suitStock: 5 });
  shopper = await createUser();
});
beforeEach(() => setStock(catalog.suit.skuId, 5));

const suit = (quantity = 1) => ({
  productId: catalog.suit.id,
  quantity,
  selections: [catalog.options.peakLapel],
});

describe("placing an order", () => {
  it("charges exactly the quoted total and stores the breakdown in pence", async () => {
    const { body: q } = await quote(shopper, {
      items: [suit()],
      country: "GB",
    });
    const { status, body } = await placeOrder(shopper, {
      items: [suit()],
      expectedTotal: q.quote.total,
    });
    expect(status).toBe(201);
    expect(body.requiresPayment).toBe(true);

    const order = await orderRow(body.orderId);
    expect(order).toMatchObject({
      status: "pending",
      currency: "GBP",
      subtotal: 54000,
      total: q.quote.total,
      vatTotal: q.quote.vatIncluded,
    });
    expect(order.items[0]).toMatchObject({
      unitPrice: 54000,
      quantity: 1,
      productItemId: catalog.suit.skuId,
    });
    expect(order.items[0]!.customizationSnapsot).toMatchObject({
      options: [{ group: "Lapel", name: "Peak lapel", priceDelta: 4000 }],
    });
  });

  it("refuses the order if the price changed since the shopper saw it", async () => {
    const { status, body } = await placeOrder(shopper, {
      items: [suit()],
      expectedTotal: 1,
    });
    expect(status).toBe(409);
    expect(body.code).toBe("PRICE_CHANGED");
    expect(body.quote.total).toBe(54000);
    expect(await stockOf(catalog.suit.skuId)).toBe(5);
  });

  it("returns the same order for a retried request (idempotency key)", async () => {
    const key = idempotencyKey();
    const first = await placeOrder(shopper, { items: [suit()] }, key);
    const retry = await placeOrder(shopper, { items: [suit()] }, key);
    expect(retry.status).toBe(200);
    expect(retry.body).toEqual({ orderId: first.body.orderId, reused: true });
    expect(await stockOf(catalog.suit.skuId)).toBe(4); // reserved once
  });

  it("validates shipping details and requires the idempotency key", async () => {
    const { app } = await import("./helpers.js");
    const missingKey = await app.request("/orders", {
      method: "POST",
      headers: { ...shopper.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [suit()] }),
    });
    expect(missingKey.status).toBe(400);
    const badShipping = await placeOrder(shopper, {
      items: [suit()],
      shipping: { fullName: "" },
    });
    expect(badShipping.status).toBe(400);
  });

  it("redeems a limited coupon only once", async () => {
    const promo = await createPromotion({
      type: "fixed_amount",
      amountOff: 2500,
      usageLimit: 1,
    });
    const first = await placeOrder(shopper, {
      items: [suit()],
      promoCode: promo.code,
    });
    expect(first.status).toBe(201);
    expect((await orderRow(first.body.orderId)).discountTotal).toBe(2500);

    const second = await placeOrder(shopper, {
      items: [suit()],
      promoCode: promo.code,
    });
    expect(second.status).toBe(409);
    expect(second.body.code).toBe("PROMO_INVALID");
    const [row] = await db
      .select()
      .from(promotionTable)
      .where(eq(promotionTable.id, promo.id));
    expect(row!.usageCount).toBe(1);
  });
});

describe("atomic stock reservation", () => {
  it("reserves stock when the order is placed", async () => {
    await placeOrder(shopper, { items: [suit(2)] });
    expect(await stockOf(catalog.suit.skuId)).toBe(3);
  });

  it("blocks checkout when stock is short and says what is left", async () => {
    await setStock(catalog.suit.skuId, 1);
    const { status, body } = await placeOrder(shopper, { items: [suit(2)] });
    expect(status).toBe(409);
    expect(body).toMatchObject({
      code: "OUT_OF_STOCK",
      error: "Out of stock: Navy Suit (only 1 left)",
      items: [{ productId: catalog.suit.id, requested: 2, available: 1 }],
    });
    expect(await stockOf(catalog.suit.skuId)).toBe(1);
  });

  it("never oversells when shoppers race for the last units", async () => {
    await setStock(catalog.suit.skuId, 3);
    const racers = await Promise.all(
      Array.from({ length: 8 }, () => createUser()),
    );
    const results = await Promise.all(
      racers.map((r) => placeOrder(r, { items: [suit()] })),
    );

    const placed = results.filter((r) => r.status === 201).length;
    const refused = results.filter(
      (r) => r.status === 409 && r.body.code === "OUT_OF_STOCK",
    ).length;
    expect([placed, refused]).toEqual([3, 5]);
    expect(await stockOf(catalog.suit.skuId)).toBe(0);
  });

  it("does not limit made-to-order products", async () => {
    const { status } = await placeOrder(shopper, {
      items: [{ productId: catalog.shirt.id, quantity: 10 }],
    });
    expect(status).toBe(201);
  });
});

describe("measurement snapshots", () => {
  it("keeps the measurements the order was placed with when the profile changes", async () => {
    const measurements = {
      unit: "cm",
      height: 182,
      chest: 101,
      waist: 86,
      hips: 99,
      inseam: 83,
      shoulder: 47,
    };
    const [profile] = await db
      .insert(userMeasurements)
      .values({
        userId: shopper.id,
        profileName: "Wedding",
        ...Object.fromEntries(
          Object.entries(measurements).map(([k, v]) => [
            k,
            typeof v === "number" ? String(v) : v,
          ]),
        ),
      } as typeof userMeasurements.$inferInsert)
      .returning();

    const { body } = await placeOrder(shopper, {
      items: [{ ...suit(), measurements }],
    });

    // The customer later updates their saved profile
    await db
      .update(userMeasurements)
      .set({ chest: "110.00", waist: "95.00" })
      .where(eq(userMeasurements.id, profile!.id));

    const order = await orderRow(body.orderId);
    expect(order.items[0]!.measurementSnapshot).toEqual(measurements);
  });
});
