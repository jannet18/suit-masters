import { beforeAll, describe, expect, it } from "vitest";
import {
  createCatalog,
  createUser,
  signedStripeEvent,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import { db, eq, shopOrder } from "@repo/db";
import {
  app,
  orderStatus,
  paymentIntent,
  pendingOrder,
  sendWebhook,
  stockOf,
} from "./helpers.js";

let catalog: TestCatalog;
let shopper: TestUser;

beforeAll(async () => {
  catalog = await createCatalog({ suitStock: 50 });
  shopper = await createUser();
});

describe("signature verification", () => {
  it("rejects requests without a signature", async () => {
    const res = await app.request("/webhook", { method: "POST", body: "{}" });
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Missing signature");
  });

  it("rejects events signed with the wrong secret", async () => {
    const order = await pendingOrder(shopper, catalog);
    const res = await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, order.total),
      {
        secret: "whsec_attacker",
      },
    );
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/signature verification failed/);
    expect((await orderStatus(order.id)).status).toBe("pending");
  });

  it("rejects a validly signed payload that was tampered with", async () => {
    const order = await pendingOrder(shopper, catalog);
    const { payload, signature } = signedStripeEvent(
      "payment_intent.succeeded",
      paymentIntent(order.id, 1),
    );
    const tampered = payload.replace('"amount":1', `"amount":${order.total}`);
    const res = await app.request("/webhook", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body: tampered,
    });
    expect(res.status).toBe(400);
  });

  it("ignores event types it doesn't handle", async () => {
    const res = await sendWebhook("customer.created", {
      id: "cus_1",
      object: "customer",
    });
    expect(res.status).toBe(200);
  });
});

describe("payment_intent.succeeded", () => {
  it("marks the order paid when the amount matches to the penny", async () => {
    const order = await pendingOrder(shopper, catalog, { total: 54049 });
    const res = await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, 54049),
    );
    expect(res.status).toBe(200);
    expect(await orderStatus(order.id)).toMatchObject({
      status: "paid",
      stripePaymentIntentId: `pi_test_${order.id}`,
    });
  });

  it("flags an amount mismatch for review instead of marking it paid", async () => {
    const order = await pendingOrder(shopper, catalog, { total: 54049 });
    await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, 54048),
    );
    expect((await orderStatus(order.id)).status).toBe("payment_review");
  });

  it("flags a currency mismatch for review", async () => {
    const order = await pendingOrder(shopper, catalog);
    await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, order.total, { currency: "usd" }),
    );
    expect((await orderStatus(order.id)).status).toBe("payment_review");
  });

  it("is idempotent when Stripe redelivers the event", async () => {
    const order = await pendingOrder(shopper, catalog);
    await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, order.total),
    );
    const again = await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, order.total),
    );
    expect(again.status).toBe(200);
    expect((await orderStatus(order.id)).status).toBe("paid");
  });

  it("does not revive an order that was already cancelled", async () => {
    const order = await pendingOrder(shopper, catalog);
    await db
      .update(shopOrder)
      .set({ status: "cancelled", stockReleasedAt: new Date() })
      .where(eq(shopOrder.id, order.id));
    await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, order.total),
    );
    expect((await orderStatus(order.id)).status).toBe("cancelled");
  });
});

describe("failed and cancelled payments", () => {
  it("payment_failed keeps the order payable", async () => {
    const order = await pendingOrder(shopper, catalog);
    await sendWebhook(
      "payment_intent.payment_failed",
      paymentIntent(order.id, order.total, {
        last_payment_error: { message: "Card declined" },
      }),
    );
    expect((await orderStatus(order.id)).status).toBe("payment_failed");
    // …and a retry that succeeds still completes it
    await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, order.total),
    );
    expect((await orderStatus(order.id)).status).toBe("paid");
  });

  it("payment_intent.canceled cancels the order and returns its stock once", async () => {
    const before = await stockOf(catalog.suit.skuId);
    const order = await pendingOrder(shopper, catalog, { quantity: 2 });
    expect(await stockOf(catalog.suit.skuId)).toBe(before - 2);

    await sendWebhook(
      "payment_intent.canceled",
      paymentIntent(order.id, order.total),
    );
    await sendWebhook(
      "payment_intent.canceled",
      paymentIntent(order.id, order.total),
    );
    expect((await orderStatus(order.id)).status).toBe("cancelled");
    expect(await stockOf(catalog.suit.skuId)).toBe(before);
  });
});

describe("charge.refunded", () => {
  const charge = (orderId: number, amountRefunded: number, full: boolean) => ({
    id: `ch_${orderId}_${amountRefunded}`,
    object: "charge",
    payment_intent: `pi_test_${orderId}`,
    amount_refunded: amountRefunded,
    refunded: full,
    currency: "gbp",
    metadata: {},
  });

  async function paidOrder() {
    const order = await pendingOrder(shopper, catalog, {
      paymentIntentId: undefined,
    });
    await sendWebhook(
      "payment_intent.succeeded",
      paymentIntent(order.id, order.total),
    );
    return order;
  }

  it("a partial refund leaves the order as it is", async () => {
    const order = await paidOrder();
    const stock = await stockOf(catalog.suit.skuId);
    await sendWebhook("charge.refunded", charge(order.id, 1000, false));
    expect((await orderStatus(order.id)).status).toBe("paid");
    expect(await stockOf(catalog.suit.skuId)).toBe(stock);
  });

  it("a full refund closes the order and returns its stock", async () => {
    const order = await paidOrder();
    const stock = await stockOf(catalog.suit.skuId);
    await sendWebhook("charge.refunded", charge(order.id, order.total, true));
    expect((await orderStatus(order.id)).status).toBe("refunded");
    expect(await stockOf(catalog.suit.skuId)).toBe(stock + 1);
  });

  it("finds the order through the PaymentIntent (charges carry no order metadata)", async () => {
    const res = await sendWebhook("charge.refunded", charge(987654, 100, true));
    expect(res.status).toBe(200); // unknown order: acknowledged, nothing changed
  });
});
