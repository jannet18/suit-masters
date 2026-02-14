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
import { Hono } from "hono";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as any,
});
export const paymentRoutes = new Hono();

paymentRoutes.post("/create-intent", async (c) => {
  try {
    const { orderId, amount } = await c.req.json();

    if (!orderId || !amount) {
      return c.json({ error: "Order ID and amount required" }, 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: "usd",
      metadata: { orderId },
    });

    return c.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    return c.json({ error: "PaymentIntent creation failed" }, 500);
  }
});
