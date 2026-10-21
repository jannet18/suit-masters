import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { orderItems, shopOrder } from "./schema/orders.js";
import { productItem } from "./schema/products.js";
export class OutOfStockError extends Error {
    shortfalls;
    constructor(shortfalls) {
        super("One or more items are out of stock");
        this.shortfalls = shortfalls;
        this.name = "OutOfStockError";
    }
}
/**
 * Atomically reserve `quantity` units of a product from a single SKU.
 *
 * Returns the SKU id the stock was taken from, or null when the product has no
 * active SKUs (made to order, not stock-limited). Returns a shortfall when
 * there is not enough stock; the caller decides whether to abort.
 */
export async function reserveStock(tx, productId, quantity) {
    // The outer `stock >= quantity` re-check is what makes this safe under
    // concurrency: a competing transaction that decremented the row first makes
    // this UPDATE match nothing instead of driving stock negative.
    const reserved = await tx.execute(sql `
    UPDATE product_item
    SET stock = stock - ${quantity}
    WHERE id = (
      SELECT id FROM product_item
      WHERE product_id = ${productId}
        AND is_active = true
        AND stock >= ${quantity}
      ORDER BY stock DESC
      LIMIT 1
      FOR UPDATE
    )
    AND stock >= ${quantity}
    RETURNING id
  `);
    const row = reserved.rows[0];
    if (row)
        return { productItemId: Number(row.id) };
    const [tracked] = await tx
        .select({
        skuCount: sql `count(*)::int`,
        available: sql `coalesce(sum(${productItem.stock}), 0)::int`,
    })
        .from(productItem)
        .where(and(eq(productItem.productId, productId), eq(productItem.isActive, true)));
    if (!tracked || tracked.skuCount === 0)
        return { productItemId: null };
    return {
        shortfall: { productId, requested: quantity, available: tracked.available },
    };
}
/**
 * Return an order's reserved stock to its SKUs. Idempotent: only the first
 * call for an order restores stock; later calls (e.g. a webhook retry after an
 * admin cancel) are no-ops. Returns true if stock was restored by this call.
 */
export async function releaseOrderStock(tx, orderId) {
    const [claimed] = await tx
        .update(shopOrder)
        .set({ stockReleasedAt: new Date() })
        .where(and(eq(shopOrder.id, orderId), isNull(shopOrder.stockReleasedAt)))
        .returning({ id: shopOrder.id });
    if (!claimed)
        return false;
    const items = await tx
        .select({
        productItemId: orderItems.productItemId,
        quantity: orderItems.quantity,
    })
        .from(orderItems)
        .where(and(eq(orderItems.orderId, orderId), isNotNull(orderItems.productItemId)));
    for (const item of items) {
        await tx
            .update(productItem)
            .set({ stock: sql `${productItem.stock} + ${item.quantity}` })
            .where(eq(productItem.id, item.productItemId));
    }
    return true;
}
