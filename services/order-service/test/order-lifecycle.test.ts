import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createCatalog,
  createUser,
  getFakeStripe,
  json,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import { db, eq, refundRequest } from "@repo/db";
import {
  app,
  orderRow,
  placeOrder,
  setOrder,
  setStatus,
  setStock,
  stockOf,
} from "./helpers.js";

let catalog: TestCatalog;
let shopper: TestUser;
let admin: TestUser;

beforeAll(async () => {
  catalog = await createCatalog();
  [shopper, admin] = await Promise.all([createUser(), createUser("ADMIN")]);
});
beforeEach(() => setStock(catalog.suit.skuId, 5));

/** An order for 2 suits, paid (as the Stripe webhook would leave it). */
async function paidOrder() {
  const { body } = await placeOrder(shopper, {
    items: [{ productId: catalog.suit.id, quantity: 2 }],
  });
  await setOrder(body.orderId, {
    status: "paid",
    stripePaymentIntentId: `pi_test_${body.orderId}`,
  });
  return body.orderId as number;
}

describe("order state machine (admin status updates)", () => {
  it("moves a paid order through production to delivery", async () => {
    const orderId = await paidOrder();
    for (const status of [
      "confirmed",
      "processing",
      "in_production",
      "quality_check",
      "shipped",
      "delivered",
    ]) {
      const res = await setStatus(admin, orderId, status);
      expect(res.status, `→ ${status}`).toBe(200);
      expect((await orderRow(orderId)).status).toBe(status);
    }
  });

  it("refuses to fulfil an unpaid order", async () => {
    const { body } = await placeOrder(shopper, {
      items: [{ productId: catalog.suit.id, quantity: 1 }],
    });
    const res = await setStatus(admin, body.orderId, "in_production");
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      error: "Order is pending and cannot be moved to in_production",
      allowed: ["cancelled"],
    });
    expect((await orderRow(body.orderId)).status).toBe("pending");
  });

  it("refuses to move an order backwards", async () => {
    const orderId = await paidOrder();
    await setStatus(admin, orderId, "shipped");
    const res = await setStatus(admin, orderId, "processing");
    expect(res.status).toBe(409);
    expect(res.body.allowed).toEqual(["delivered", "refunded"]);
  });

  it("rejects unknown statuses", async () => {
    const orderId = await paidOrder();
    expect((await setStatus(admin, orderId, "teleported")).status).toBe(400);
  });

  it("is admin-only", async () => {
    const orderId = await paidOrder();
    const res = await app.request(
      `/orders/${orderId}/status`,
      json({ status: "confirmed" }, shopper.headers, "PUT"),
    );
    expect(res.status).toBe(403);
  });
});

describe("stock release on cancellation", () => {
  it("returns reserved stock exactly once", async () => {
    const orderId = await paidOrder();
    expect(await stockOf(catalog.suit.skuId)).toBe(3);

    expect((await setStatus(admin, orderId, "cancelled")).status).toBe(200);
    expect(await stockOf(catalog.suit.skuId)).toBe(5);
    expect((await orderRow(orderId)).stockReleasedAt).not.toBeNull();

    // Re-sending the same status is a no-op, and a cancelled order is terminal
    await setStatus(admin, orderId, "cancelled");
    expect((await setStatus(admin, orderId, "paid")).status).toBe(409);
    expect(await stockOf(catalog.suit.skuId)).toBe(5);
  });

  it("can't cancel once shipped", async () => {
    const orderId = await paidOrder();
    await setStatus(admin, orderId, "shipped");
    expect((await setStatus(admin, orderId, "cancelled")).status).toBe(409);
    expect(await stockOf(catalog.suit.skuId)).toBe(3);
  });
});

describe("refunds", () => {
  /** A delivered order with a customer refund request, ready for approval. */
  async function refundRequested() {
    const orderId = await paidOrder();
    await setStatus(admin, orderId, "delivered");
    const res = await app.request(
      "/refunds",
      json({ orderId, reason: "wrong_size" }, shopper.headers),
    );
    expect(res.status).toBe(201);
    const [refund] = await db
      .select()
      .from(refundRequest)
      .where(eq(refundRequest.orderId, orderId));
    return { orderId, refundId: refund!.id };
  }

  it("customers can only request refunds for delivered or shipped orders", async () => {
    const orderId = await paidOrder();
    const res = await app.request(
      "/refunds",
      json({ orderId, reason: "wrong_size" }, shopper.headers),
    );
    expect(res.status).toBe(400);
  });

  it("approval refunds the exact order total through Stripe and returns stock", async () => {
    const { orderId, refundId } = await refundRequested();
    const order = await orderRow(orderId);

    const res = await app.request(
      `/refunds/${refundId}/approve`,
      json({ adminNotes: "ok" }, admin.headers, "PUT"),
    );
    expect(res.status).toBe(200);

    const stripeCall = getFakeStripe()
      .calls.filter((c) => c.path === "/v1/refunds")
      .at(-1)!;
    expect(stripeCall.body).toMatchObject({
      payment_intent: `pi_test_${orderId}`,
      amount: String(order.total),
    });
    expect(stripeCall.idempotencyKey).toBe(`refund-request-${refundId}`);
    expect(await stockOf(catalog.suit.skuId)).toBe(5);

    const [refund] = await db
      .select()
      .from(refundRequest)
      .where(eq(refundRequest.id, refundId));
    expect(refund).toMatchObject({
      status: "processing",
      stripeRefundId: expect.stringMatching(/^re_3Fake/),
    });
  });

  it("a declined Stripe refund changes nothing", async () => {
    const { refundId } = await refundRequested();
    getFakeStripe().failNextRefund("Your card was declined.");
    const res = await app.request(
      `/refunds/${refundId}/approve`,
      json({}, admin.headers, "PUT"),
    );
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/declined/);
    const [refund] = await db
      .select()
      .from(refundRequest)
      .where(eq(refundRequest.id, refundId));
    expect(refund!.status).toBe("requested");
    expect(await stockOf(catalog.suit.skuId)).toBe(3);
  });

  it("rejection keeps the order and its stock as they are", async () => {
    const { orderId, refundId } = await refundRequested();
    const res = await app.request(
      `/refunds/${refundId}/reject`,
      json({ adminNotes: "worn" }, admin.headers, "PUT"),
    );
    expect(res.status).toBe(200);
    expect((await orderRow(orderId)).status).toBe("delivered");
    expect(await stockOf(catalog.suit.skuId)).toBe(3);
  });

  it("only admins can approve", async () => {
    const { refundId } = await refundRequested();
    const res = await app.request(
      `/refunds/${refundId}/approve`,
      json({}, shopper.headers, "PUT"),
    );
    expect(res.status).toBe(403);
  });
});
