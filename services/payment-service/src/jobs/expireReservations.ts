import { db, and, inArray, isNull, lt, shopOrder } from "@repo/db";
import { PAYABLE_STATUSES } from "../routes/paymentRoutes.js";
import { cancelUnpaidOrder } from "../routes/webhook.js";

/**
 * Releases stock held by orders that were placed but never paid.
 *
 * Stock is reserved when an order is created. If the customer abandons
 * payment, this job cancels the order once its reservation is older than
 * RESERVATION_TTL_MINUTES (default 30) and returns the stock. Safe to run on
 * several instances at once: cancellation and release are both conditional.
 */

import { stripe } from "../lib/stripe.js";

const TTL_MINUTES = Number(process.env.RESERVATION_TTL_MINUTES) || 30;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

export async function expireStaleReservations(): Promise<number> {
  const cutoff = new Date(Date.now() - TTL_MINUTES * 60 * 1000);

  const stale = await db
    .select({
      id: shopOrder.id,
      paymentIntentId: shopOrder.stripePaymentIntentId,
    })
    .from(shopOrder)
    .where(
      and(
        inArray(shopOrder.status, PAYABLE_STATUSES),
        isNull(shopOrder.stockReleasedAt),
        lt(shopOrder.createdAt, cutoff),
      ),
    )
    .limit(100);

  let expired = 0;
  for (const order of stale) {
    try {
      // Cancel the PaymentIntent first so the customer can't pay after the
      // stock has gone back on sale. If Stripe refuses (already succeeded or
      // mid-processing), leave the order for the webhook to settle.
      if (order.paymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(order.paymentIntentId);
        if (pi.status === "succeeded" || pi.status === "processing") continue;
        if (pi.status !== "canceled") {
          await stripe.paymentIntents.cancel(order.paymentIntentId);
        }
      }

      if (await cancelUnpaidOrder(order.id)) {
        expired++;
        console.log(
          `[Reservations] Order #${order.id} expired unpaid; stock released`,
        );
      }
    } catch (err: any) {
      console.error(
        `[Reservations] Failed to expire order #${order.id}: ${err.message}`,
      );
    }
  }

  return expired;
}

export function startReservationSweeper() {
  const run = () =>
    expireStaleReservations().catch((err) =>
      console.error(`[Reservations] Sweep failed: ${err.message}`),
    );
  run();
  return setInterval(run, SWEEP_INTERVAL_MS);
}
