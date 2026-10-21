import { db } from "./db.js";
/**
 * Inventory lifecycle shared by order-service and payment-service.
 *
 * Stock is reserved (decremented) when an order is created, before payment,
 * so two shoppers can never both buy the last unit. It is released back when
 * the order is cancelled, its payment is cancelled/expires, or it is refunded.
 */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type StockShortfall = {
    productId: number;
    requested: number;
    available: number;
};
export declare class OutOfStockError extends Error {
    readonly shortfalls: StockShortfall[];
    constructor(shortfalls: StockShortfall[]);
}
/**
 * Atomically reserve `quantity` units of a product from a single SKU.
 *
 * Returns the SKU id the stock was taken from, or null when the product has no
 * active SKUs (made to order, not stock-limited). Returns a shortfall when
 * there is not enough stock; the caller decides whether to abort.
 */
export declare function reserveStock(tx: Tx, productId: number, quantity: number): Promise<{
    productItemId: number | null;
} | {
    shortfall: StockShortfall;
}>;
/**
 * Return an order's reserved stock to its SKUs. Idempotent: only the first
 * call for an order restores stock; later calls (e.g. a webhook retry after an
 * admin cancel) are no-ops. Returns true if stock was restored by this call.
 */
export declare function releaseOrderStock(tx: Tx, orderId: number): Promise<boolean>;
//# sourceMappingURL=inventory.d.ts.map