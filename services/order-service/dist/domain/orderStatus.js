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
];
export const ORDER_STATUSES = [
    "pending",
    "payment_failed",
    "payment_review",
    "disputed",
    ...FULFILMENT_FLOW,
    "cancelled",
    "refunded",
];
/** Statuses whose reserved stock has been returned; nothing leaves them. */
export const TERMINAL_STATUSES = [
    "cancelled",
    "refunded",
];
const fulfilmentIndex = (s) => FULFILMENT_FLOW.indexOf(s);
export function isOrderStatus(value) {
    return ORDER_STATUSES.includes(value);
}
/** Every status an admin may move an order to from `from`. */
export function allowedTransitions(from) {
    if (TERMINAL_STATUSES.includes(from))
        return [];
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
    if (index === -1)
        return [];
    const forward = FULFILMENT_FLOW.slice(index + 1);
    // Can still be cancelled until it has left the workshop
    const cancellable = index < fulfilmentIndex("shipped") ? ["cancelled"] : [];
    return [...forward, ...cancellable, "refunded"];
}
export function canTransition(from, to) {
    return allowedTransitions(from).includes(to);
}
