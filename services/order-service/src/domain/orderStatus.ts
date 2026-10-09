/**
 * Order lifecycle.
 *
 *   pending ──(Stripe webhook)──▶ paid ─▶ confirmed ─▶ processing ─▶ in_production
 *      │                           │                                    │
 *      └─▶ payment_failed          └─▶ … ─▶ quality_check ─▶ shipped ─▶ delivered
 *
 * Payment states (pending, payment_failed, payment_review, disputed) are
 * driven by Stripe; fulfilment states move forward only (skipping is allowed,
 * going back is not). cancelled and refunded are terminal and return stock.
 */

export const FULFILMENT_FLOW = [
  "paid",
  "confirmed",
  "processing",
  "in_production",
  "quality_check",
  "shipped",
  "delivered",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "payment_failed",
  "payment_review",
  "disputed",
  ...FULFILMENT_FLOW,
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses whose reserved stock has been returned; nothing leaves them. */
export const TERMINAL_STATUSES: readonly OrderStatus[] = [
  "cancelled",
  "refunded",
];

const fulfilmentIndex = (s: string) =>
  FULFILMENT_FLOW.indexOf(s as (typeof FULFILMENT_FLOW)[number]);

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Every status an admin may move an order to from `from`. */
export function allowedTransitions(from: string): OrderStatus[] {
  if (TERMINAL_STATUSES.includes(from as OrderStatus)) return [];
  switch (from) {
    // Unpaid: only Stripe can mark them paid; an admin can only cancel
    case "pending":
    case "payment_failed":
      return ["cancelled"];
    // Amount mismatch flagged by the webhook: an admin resolves it
    case "payment_review":
      return ["paid", "cancelled", "refunded"];
    case "disputed":
      return ["paid", "refunded"];
  }
  const index = fulfilmentIndex(from);
  if (index === -1) return [];
  const forward = FULFILMENT_FLOW.slice(index + 1);
  // Can still be cancelled until it has left the workshop
  const cancellable =
    index < fulfilmentIndex("shipped") ? (["cancelled"] as const) : [];
  return [...forward, ...cancellable, "refunded"];
}

export function canTransition(from: string, to: string): boolean {
  return allowedTransitions(from).includes(to as OrderStatus);
}
