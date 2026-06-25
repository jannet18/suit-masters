import { Hono } from "hono";
import Stripe from "stripe";
import { db, eq, shopOrder } from "@repo/db";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia" as any,
});

/**
 * Stripe Webhook Handler
 *
 * Handles all Stripe events with proper signature verification,
 * event logging, and comprehensive status updates.
 *
 * Required environment variables:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 */
export const webhookRoutes = new Hono();

/**
 * POST /webhook
 * Stripe sends events here. We verify the signature and handle each event type.
 */
webhookRoutes.post("/", async (c) => {
  const sig = c.req.header("stripe-signature");

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return c.text("Missing signature", 400);
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return c.text("Webhook not configured", 500);
  }

  // We need the raw body for signature verification
  // Hono automatically provides the raw body via c.req.text()
  const body = await c.req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return c.text(`Webhook signature verification failed: ${err.message}`, 400);
  }

  // Log the event for audit trail
  console.log(`[Webhook] Received event: ${event.type} (ID: ${event.id})`);

  try {
    // Route to the appropriate handler based on event type
    switch (event.type) {
      // ─── Payment Events ───────────────────────────────────────────────
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.amount_capturable_updated":
        await handlePaymentIntentCapturable(event.data.object as Stripe.PaymentIntent);
        break;

      // ─── Charge Events ────────────────────────────────────────────────
      case "charge.succeeded":
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case "charge.failed":
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case "charge.dispute.closed":
        await handleDisputeClosed(event.data.object as Stripe.Dispute);
        break;

      // ─── Checkout Session Events ──────────────────────────────────────
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "checkout.session.expired":
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      // ─── Invoice Events ───────────────────────────────────────────────
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (err: any) {
    console.error(`[Webhook] Error processing ${event.type}: ${err.message}`);
    // Return 200 to prevent Stripe from retrying events we intentionally don't handle
    // For critical errors, return 500 to trigger Stripe retry
    return c.json({ error: err.message }, 500);
  }
});

// ─── Event Handlers ──────────────────────────────────────────────────────────

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.orderId;
  if (!orderId) {
    console.log(`[Webhook] payment_intent.succeeded without orderId metadata. PI: ${pi.id}`);
    return;
  }

  const status = "paid";
  await updateOrderStatus(Number(orderId), status, `Payment confirmed via Stripe (PI: ${pi.id})`);
  console.log(`[Webhook] Order #${orderId} marked as ${status}`);
}

async function handlePaymentIntentFailed(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.orderId;
  if (!orderId) {
    console.log(`[Webhook] payment_intent.payment_failed without orderId metadata. PI: ${pi.id}`);
    return;
  }

  const failureReason = pi.last_payment_error?.message || "Unknown payment failure";
  await updateOrderStatus(
    Number(orderId),
    "payment_failed",
    `Payment failed: ${failureReason} (PI: ${pi.id})`,
  );
  console.log(`[Webhook] Order #${orderId} marked as payment_failed: ${failureReason}`);
}

async function handlePaymentIntentCanceled(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.orderId;
  if (!orderId) return;

  await updateOrderStatus(
    Number(orderId),
    "cancelled",
    `Payment intent cancelled (PI: ${pi.id})`,
  );
  console.log(`[Webhook] Order #${orderId} marked as cancelled (PI canceled)`);
}

async function handlePaymentIntentCapturable(pi: Stripe.PaymentIntent) {
  console.log(`[Webhook] payment_intent.amount_capturable_updated for PI: ${pi.id}. Amount: ${pi.amount_capturable}`);
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
  const orderId = charge.metadata?.orderId;
  if (orderId) {
    console.log(`[Webhook] Charge succeeded for Order #${orderId}. Charge: ${charge.id}`);
  }
}

async function handleChargeFailed(charge: Stripe.Charge) {
  const orderId = charge.metadata?.orderId;
  if (orderId) {
    console.log(`[Webhook] Charge failed for Order #${orderId}. Charge: ${charge.id}`);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const orderId = charge.metadata?.orderId;
  if (!orderId) {
    console.log(`[Webhook] charge.refunded without orderId metadata. Charge: ${charge.id}`);
    return;
  }

  const refundAmount = charge.amount_refunded / 100; // Convert from cents
  await updateOrderStatus(
    Number(orderId),
    "refunded",
    `Charge refunded: £${refundAmount.toFixed(2)} (Charge: ${charge.id})`,
  );
  console.log(`[Webhook] Order #${orderId} marked as refunded. Amount: £${refundAmount.toFixed(2)}`);
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const orderId = dispute.metadata?.orderId || (dispute.payment_intent as string);
  console.log(`[Webhook] Dispute created: ${dispute.id} for payment: ${dispute.payment_intent}`);

  // If we can find an order, mark it as disputed
  if (orderId) {
    await updateOrderStatus(
      Number(orderId),
      "disputed",
      `Dispute opened: ${dispute.id} - Reason: ${dispute.reason}`,
    );
  }
}

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  console.log(`[Webhook] Dispute closed: ${dispute.id}. Status: ${dispute.status}`);

  const orderId = dispute.metadata?.orderId || (dispute.payment_intent as string);
  if (orderId && dispute.status === "won") {
    await updateOrderStatus(
      Number(orderId),
      "paid",
      `Dispute resolved in favor of merchant: ${dispute.id}`,
    );
  } else if (orderId && dispute.status === "lost") {
    await updateOrderStatus(
      Number(orderId),
      "refunded",
      `Dispute lost: ${dispute.id}`,
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (orderId) {
    await updateOrderStatus(
      Number(orderId),
      "paid",
      `Checkout session completed: ${session.id}`,
    );
    console.log(`[Webhook] Order #${orderId} marked as paid via checkout session`);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (orderId) {
    console.log(`[Webhook] Checkout session expired for Order #${orderId}. Session: ${session.id}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice payment succeeded: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);
}

// ─── Helper Functions ────────────────────────────────────────────────────────

async function updateOrderStatus(orderId: number, status: string, notes: string) {
  try {
    await db
      .update(shopOrder)
      .set({ status })
      .where(eq(shopOrder.id, orderId));

    console.log(`[Webhook] Order #${orderId} status updated to "${status}". Notes: ${notes}`);
  } catch (err: any) {
    console.error(`[Webhook] Failed to update order #${orderId}: ${err.message}`);
    throw err;
  }
}