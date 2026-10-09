import {
  db,
  eq,
  orderItems,
  productItem,
  reserveStock,
  shopOrder,
} from "@repo/db";
import {
  signedStripeEvent,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import app from "../src/app.js";

export { app };

/** An order as order-service leaves it: pending, with its stock reserved. */
export async function pendingOrder(
  user: TestUser,
  catalog: TestCatalog,
  opts: {
    quantity?: number;
    total?: number;
    createdAt?: Date;
    paymentIntentId?: string;
  } = {},
) {
  const quantity = opts.quantity ?? 1;
  return db.transaction(async (tx) => {
    const reservation = await reserveStock(tx, catalog.suit.id, quantity);
    if (!("productItemId" in reservation))
      throw new Error("test setup: not enough stock");
    const [order] = await tx
      .insert(shopOrder)
      .values({
        userId: user.id,
        total: opts.total ?? catalog.suit.basePrice * quantity,
        status: "pending",
        currency: "GBP",
        stripePaymentIntentId: opts.paymentIntentId ?? null,
        shipping_name: "Jo",
        shipping_email: "jo@test.local",
        shipping_phone: "1",
        shipping_address_line1: "1 Savile Row",
        shipping_city: "London",
        shipping_region: "",
        shipping_postal_code: "W1S 3PR",
        shipping_country: "United Kingdom",
        ...(opts.createdAt ? { createdAt: opts.createdAt } : {}),
      })
      .returning();
    await tx.insert(orderItems).values({
      orderId: order!.id,
      productId: catalog.suit.id,
      productItemId: reservation.productItemId,
      productNameSnapshot: "Navy Suit",
      unitPrice: catalog.suit.basePrice,
      priceAtPurchase: catalog.suit.basePrice,
      quantity,
    });
    return order!;
  });
}

export async function orderStatus(orderId: number) {
  const [row] = await db
    .select()
    .from(shopOrder)
    .where(eq(shopOrder.id, orderId));
  return row!;
}

export async function stockOf(skuId: number) {
  const [row] = await db
    .select({ stock: productItem.stock })
    .from(productItem)
    .where(eq(productItem.id, skuId));
  return row!.stock;
}

/** POST a signed Stripe event to the webhook, as Stripe would. */
export async function sendWebhook(
  type: string,
  object: Record<string, unknown>,
  opts: { secret?: string } = {},
) {
  const { payload, signature } = signedStripeEvent(type, object, opts.secret);
  const res = await app.request("/webhook", {
    method: "POST",
    headers: {
      "stripe-signature": signature,
      "content-type": "application/json",
    },
    body: payload,
  });
  return { status: res.status, text: await res.text() };
}

export function paymentIntent(
  orderId: number,
  amount: number,
  extra: Record<string, unknown> = {},
) {
  return {
    id: `pi_test_${orderId}`,
    object: "payment_intent",
    amount,
    amount_received: amount,
    currency: "gbp",
    metadata: { orderId: String(orderId) },
    ...extra,
  };
}
