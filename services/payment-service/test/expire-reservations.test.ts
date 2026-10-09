import { beforeAll, describe, expect, it } from "vitest";
import {
  createCatalog,
  createUser,
  getFakeStripe,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import { expireStaleReservations } from "../src/jobs/expireReservations.js";
import { orderStatus, pendingOrder, stockOf } from "./helpers.js";

let catalog: TestCatalog;
let shopper: TestUser;
const longAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

beforeAll(async () => {
  catalog = await createCatalog({ suitStock: 50 });
  shopper = await createUser();
});

/** A PaymentIntent that exists in the fake Stripe with the given status. */
function intent(status: string) {
  const id = `pi_sweep_${Math.random().toString(36).slice(2)}`;
  getFakeStripe().paymentIntents.set(id, {
    id,
    object: "payment_intent",
    amount: 50000,
    currency: "gbp",
    status,
    client_secret: `${id}_s`,
    metadata: {},
  });
  return id;
}

describe("expiring unpaid reservations", () => {
  it("cancels stale unpaid orders, cancels their PaymentIntent and returns stock", async () => {
    const stock = await stockOf(catalog.suit.skuId);
    const pi = intent("requires_payment_method");
    const stale = await pendingOrder(shopper, catalog, {
      quantity: 2,
      createdAt: longAgo,
      paymentIntentId: pi,
    });
    const fresh = await pendingOrder(shopper, catalog);

    await expireStaleReservations();

    expect((await orderStatus(stale.id)).status).toBe("cancelled");
    expect(getFakeStripe().paymentIntents.get(pi)!.status).toBe("canceled");
    expect((await orderStatus(fresh.id)).status).toBe("pending");
    expect(await stockOf(catalog.suit.skuId)).toBe(stock - 1); // only the fresh order's unit stays held
  });

  it("leaves orders alone whose payment already went through", async () => {
    const stale = await pendingOrder(shopper, catalog, {
      createdAt: longAgo,
      paymentIntentId: intent("succeeded"),
    });
    await expireStaleReservations();
    expect((await orderStatus(stale.id)).status).toBe("pending"); // the webhook will mark it paid
  });

  it("is safe to run repeatedly", async () => {
    const stock = await stockOf(catalog.suit.skuId);
    const stale = await pendingOrder(shopper, catalog, { createdAt: longAgo });
    await expireStaleReservations();
    await expireStaleReservations();
    expect((await orderStatus(stale.id)).status).toBe("cancelled");
    expect(await stockOf(catalog.suit.skuId)).toBe(stock);
  });
});
