// import { Hono } from "hono";
// import Stripe from "stripe";
// import { db, shopOrder } from "@repo/db";
// import { eq } from "drizzle-orm";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20" as any,
// });

// export const paymentRoutes = new Hono();

// /**
//  * POST /payments/create-intent
//  * Creates a Stripe PaymentIntent for an existing order
//  */
// paymentRoutes.post("/create-intent", async (c) => {
//   try {
//     const { orderId } = await c.req.json<{ orderId: number }>();

//     const order = await db.query.shopOrder.findFirst({
//       where: (orders, { eq }) => eq(orders.id, orderId),
//     });

//     if (!order) {
//       return c.json({ error: "Order not found" }, 404);
//     }

//     if (order.status !== "PENDING") {
//       return c.json({ error: "Order already paid or invalid" }, 400);
//     }

//     const amount = Math.round(Number(order.total) * 100); // cents

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: "kes",
//       metadata: {
//         orderId: String(order.id),
//       },
//       automatic_payment_methods: { enabled: true },
//     });

//     return c.json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (err) {
//     console.error(err);
//     return c.json({ error: "Failed to create payment intent" }, 500);
//   }
// });

// /**
//  * POST /payments/webhook
//  * Stripe calls this to confirm payment
//  */
// paymentRoutes.post("/webhook", async (c) => {
//   const sig = c.req.header("stripe-signature");

//   if (!sig) {
//     return c.text("Missing signature", 400);
//   }

//   const body = await c.req.text();

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET!,
//     );
//   } catch (err) {
//     console.error("Webhook verification failed", err);
//     return c.text("Webhook error", 400);
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const intent = event.data.object as Stripe.PaymentIntent;
//     const orderId = intent.metadata.orderId;

//     if (orderId) {
//       await db
//         .update(shopOrder)
//         .set({ status: "PAID" })
//         .where(eq(shopOrder.id, Number(orderId)));
//     }
//   }

//   return c.text("ok");
// });

// services/payment-service/src/routes/paymentRoutes.ts
import { db, eq, desc, shopOrder } from "@repo/db";
import { Hono } from "hono";
import { getUser, type AuthContext } from "@repo/auth";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia" as any,
});
export const paymentRoutes = new Hono<AuthContext>();

/**
 * GET /payments
 * Admin: list payments. There's no dedicated payment-transactions table —
 * every shop_order implies a payment attempt at checkout, so orders are the
 * source of truth here, joined to the customer for display.
 */
paymentRoutes.get("/", getUser, async (c) => {
  const user = c.get("user");
  if (!user || (user as { roles?: string })?.roles !== "ADMIN") {
    return c.json({ error: "Access Denied: Unauthorised" }, 403);
  }

  try {
    const rows = await db
      .select({
        id: shopOrder.id,
        amount: shopOrder.total,
        status: shopOrder.status,
        fullName: shopOrder.shipping_name,
        email: shopOrder.shipping_email,
        createdAt: shopOrder.createdAt,
      })
      .from(shopOrder)
      .orderBy(desc(shopOrder.id))
      .limit(100);

    return c.json({ success: true, payments: rows });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return c.json({ success: false, payments: [], error: "Failed to fetch payments" }, 500);
  }
});

paymentRoutes.post("/create-intent", async (c) => {
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

    // Dynamic currency resolutiom tracking to avaid conersion drops
    const currencyCode = (order as any).currency?.toLowerCase() || process.env.SYSTEM_CURRENCY_CODE || "£"
    const amountInCents = Math.round(Number(order.total) * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currencyCode,
      metadata: {orderId: String(order.id)},
      automatic_payment_methods: {enabled: true}
    })
    // Prevent duplicate payment attempts
    if (order.status !== "PENDING_PAYMENT") {
      return c.json({ error: "Order not payable" }, 400);
    }

    // // Convert to cents
    // const amount = Math.round(Number(order.total) * 100);

    // // Create PaymentIntent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount,
    //   currency: "usd",
    //   metadata: { orderId: String(order.id) },
    //   automatic_payment_methods: { enabled: true },
    // });

    return c.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    return c.json({ error: "PaymentIntent creation failed" }, 500);
  }
});

// Webhook handler has been moved to webhook.ts for comprehensive event handling.
// The webhook route is now mounted at /webhook in the service index.
