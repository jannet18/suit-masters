// services/payment-service/src/routes/paymentRoutes.ts
import { db, eq, shopOrder } from "@repo/db";
import { Hono } from "hono";
import { getUser, type AuthEnv } from "@repo/auth";
import { stripe } from "../lib/stripe.js";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}
export const paymentRoutes = new Hono<AuthEnv>();

// Statuses an order can be paid from. payment_failed stays payable because
// Stripe lets the customer retry the same PaymentIntent.
export const PAYABLE_STATUSES = ["pending", "payment_failed"];

paymentRoutes.post("/create-intent", getUser, async (c) => {
  try {
    const { orderId } = await c.req.json<{ orderId: number }>();

    if (!orderId) {
      return c.json({ error: "Order ID required" }, 400);
    }
    // Load order from DB
    const order = await db.query.shopOrder.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
    });
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const user = c.get("user");
    if (order.userId !== user.id && user.roles !== "ADMIN") {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Only unpaid orders can be paid; cancelled/expired orders have released
    // their reserved stock and must be re-placed.
    if (!PAYABLE_STATUSES.includes(order.status)) {
      return c.json(
        { error: `Order is ${order.status} and cannot be paid` },
        400,
      );
    }

    // order.total is already integer minor units (pence), which is exactly
    // what Stripe's `amount` expects; no conversion.
    const amount = order.total;
    const currency = (order.currency ?? "GBP").toLowerCase();

    // Reuse the order's PaymentIntent on retries so one order never has two
    // live intents that could both be charged.
    if (order.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
      );
      if (existing.status !== "canceled" && existing.status !== "succeeded") {
        if (existing.amount === amount && existing.currency === currency) {
          return c.json({ clientSecret: existing.client_secret });
        }
        // Stale intent for a different amount: never let it be paid
        await stripe.paymentIntents.cancel(existing.id);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        metadata: { orderId: String(order.id) },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: `order-${order.id}-intent-${amount}-${currency}` },
    );

    await db
      .update(shopOrder)
      .set({ stripePaymentIntentId: paymentIntent.id })
      .where(eq(shopOrder.id, order.id));

    return c.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    return c.json({ error: "PaymentIntent creation failed" }, 500);
  }
});

// Webhook handler has been moved to webhook.ts for comprehensive event handling.
// The webhook route is now mounted at /webhook in the service index.
