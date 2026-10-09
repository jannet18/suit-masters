import { beforeAll, describe, expect, it } from "vitest";
import {
  createCatalog,
  createUser,
  getFakeStripe,
  json,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import { db, eq, shopOrder } from "@repo/db";
import { app, orderStatus, pendingOrder } from "./helpers.js";

let catalog: TestCatalog;
let shopper: TestUser;
let stranger: TestUser;

beforeAll(async () => {
  catalog = await createCatalog({ suitStock: 50 });
  [shopper, stranger] = await Promise.all([createUser(), createUser()]);
});

const createIntent = (user: TestUser | null, orderId: number) =>
  app.request(
    "/payments/create-intent",
    json({ orderId }, user?.headers ?? {}),
  );

describe("POST /payments/create-intent", () => {
  it("creates a PaymentIntent for the stored order total, in integer pence", async () => {
    const order = await pendingOrder(shopper, catalog, { total: 54049 });
    const res = await createIntent(shopper, order.id);
    expect(res.status).toBe(200);
    const { clientSecret } = (await res.json()) as { clientSecret: string };

    const call = getFakeStripe()
      .calls.filter((c) => c.path === "/v1/payment_intents")
      .at(-1)!;
    expect(call.body).toMatchObject({
      amount: "54049",
      currency: "gbp",
      "metadata[orderId]": String(order.id),
    });
    const stored = await orderStatus(order.id);
    expect(clientSecret).toMatch(
      new RegExp(`^${stored.stripePaymentIntentId}_secret_`),
    );
  });

  it("reuses the live PaymentIntent on retry instead of creating a second", async () => {
    const order = await pendingOrder(shopper, catalog);
    await createIntent(shopper, order.id);
    const before = getFakeStripe().calls.filter(
      (c) => c.method === "POST" && c.path === "/v1/payment_intents",
    ).length;
    const retry = await createIntent(shopper, order.id);
    expect(retry.status).toBe(200);
    const after = getFakeStripe().calls.filter(
      (c) => c.method === "POST" && c.path === "/v1/payment_intents",
    ).length;
    expect(after).toBe(before);
  });

  it("cancels a stale intent whose amount no longer matches the order", async () => {
    const order = await pendingOrder(shopper, catalog, { total: 50000 });
    await createIntent(shopper, order.id);
    const firstIntent = (await orderStatus(order.id)).stripePaymentIntentId!;
    await db
      .update(shopOrder)
      .set({ total: 45000 })
      .where(eq(shopOrder.id, order.id));

    await createIntent(shopper, order.id);
    expect(getFakeStripe().paymentIntents.get(firstIntent)!.status).toBe(
      "canceled",
    );
    const newIntent = (await orderStatus(order.id)).stripePaymentIntentId!;
    expect(getFakeStripe().paymentIntents.get(newIntent)!.amount).toBe(45000);
  });

  it("requires sign-in and only lets the owner pay", async () => {
    const order = await pendingOrder(shopper, catalog);
    expect((await createIntent(null, order.id)).status).toBe(401);
    expect((await createIntent(stranger, order.id)).status).toBe(403);
  });

  it("refuses orders that can't be paid", async () => {
    const order = await pendingOrder(shopper, catalog);
    await db
      .update(shopOrder)
      .set({ status: "cancelled" })
      .where(eq(shopOrder.id, order.id));
    const res = await createIntent(shopper, order.id);
    expect(res.status).toBe(400);
    expect((await createIntent(shopper, 999_999)).status).toBe(404);
  });
});
