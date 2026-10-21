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
export declare const FULFILMENT_FLOW: readonly ["paid", "confirmed", "processing", "in_production", "quality_check", "shipped", "delivered"];
export declare const ORDER_STATUSES: readonly ["pending", "payment_failed", "payment_review", "disputed", "paid", "confirmed", "processing", "in_production", "quality_check", "shipped", "delivered", "cancelled", "refunded"];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
/** Statuses whose reserved stock has been returned; nothing leaves them. */
export declare const TERMINAL_STATUSES: readonly OrderStatus[];
export declare function isOrderStatus(value: string): value is OrderStatus;
/** Every status an admin may move an order to from `from`. */
export declare function allowedTransitions(from: string): OrderStatus[];
export declare function canTransition(from: string, to: string): boolean;
//# sourceMappingURL=orderStatus.d.ts.map