import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "./db.js";
import { orderItems, shopOrder } from "./schema/orders.js";
import { productItem } from "./schema/products.js";

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

export class OutOfStockError extends Error {
  constructor(public readonly shortfalls: StockShortfall[]) {
    super("One or more items are out of stock");
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
export async function reserveStock(
  tx: Tx,
  productId: number,
  quantity: number,
): Promise<{ productItemId: number | null } | { shortfall: StockShortfall }> {
  // The outer `stock >= quantity` re-check is what makes this safe under
  // concurrency: a competing transaction that decremented the row first makes
  // this UPDATE match nothing instead of driving stock negative.
  const reserved = await tx.execute<{ id: number }>(sql`
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
  if (row) return { productItemId: Number(row.id) };

  const [tracked] = await tx
    .select({
      skuCount: sql<number>`count(*)::int`,
      available: sql<number>`coalesce(sum(${productItem.stock}), 0)::int`,
    })
    .from(productItem)
    .where(
      and(eq(productItem.productId, productId), eq(productItem.isActive, true)),
    );

  if (!tracked || tracked.skuCount === 0) return { productItemId: null };

  return {
    shortfall: { productId, requested: quantity, available: tracked.available },
  };
}

/**
 * Return an order's reserved stock to its SKUs. Idempotent: only the first
 * call for an order restores stock; later calls (e.g. a webhook retry after an
 * admin cancel) are no-ops. Returns true if stock was restored by this call.
 */
export async function releaseOrderStock(
  tx: Tx,
  orderId: number,
): Promise<boolean> {
  const [claimed] = await tx
    .update(shopOrder)
    .set({ stockReleasedAt: new Date() })
    .where(and(eq(shopOrder.id, orderId), isNull(shopOrder.stockReleasedAt)))
    .returning({ id: shopOrder.id });

  if (!claimed) return false;

  const items = await tx
    .select({
      productItemId: orderItems.productItemId,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(
      and(eq(orderItems.orderId, orderId), isNotNull(orderItems.productItemId)),
    );

  for (const item of items) {
    await tx
      .update(productItem)
      .set({ stock: sql`${productItem.stock} + ${item.quantity}` })
      .where(eq(productItem.id, item.productItemId!));
  }

  return true;
}
