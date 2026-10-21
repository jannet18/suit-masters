import { Hono } from "hono";
import { getUser, requireRole } from "@repo/auth";
import { db, orderItems, shopOrder, shoppingCart, shoppingCartItem, idempotencyKeys, reserveStock, releaseOrderStock, redeemPromotion, OutOfStockError, } from "@repo/db";
import { eq, desc } from "@repo/db";
import { formatCurrency } from "@repo/pricing";
import { createOrderSchema, quoteRequestSchema, validateRequest, } from "@repo/validation";
import { emailService, } from "../services/emailService.js";
import { CheckoutError, priceCheckout, } from "../services/pricing.js";
import { ORDER_STATUSES, TERMINAL_STATUSES, allowedTransitions, canTransition, isOrderStatus, } from "../domain/orderStatus.js";
export const orderRoutes = new Hono();
orderRoutes.use(getUser);
const requireAdmin = requireRole("ADMIN");
class OrderRejectedError extends Error {
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
    }
}
function quoteResponse(q, lines) {
    return {
        ...q,
        lines: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.unitPrice * l.quantity,
        })),
    };
}
/**
 * POST /orders/quote
 * Price the shopper's bag for a destination and optional promo code. Checkout
 * displays this, and POST /orders charges exactly the same calculation.
 */
orderRoutes.post("/quote", async (c) => {
    const parsed = validateRequest(quoteRequestSchema, await c.req.json().catch(() => undefined));
    if (!parsed.success)
        return c.json({ error: parsed.errors.join("; ") }, 400);
    try {
        const priced = await priceCheckout(db, {
            items: parsed.data.items,
            country: parsed.data.country,
            promoCode: parsed.data.promoCode || undefined,
            userId: c.get("user").id,
        });
        return c.json({
            quote: quoteResponse(priced.quote, priced.lines),
            promotion: priced.promotion,
            promoError: priced.promoError,
        });
    }
    catch (error) {
        if (error instanceof CheckoutError) {
            return c.json({ error: error.message, code: error.code }, 409);
        }
        throw error;
    }
});
/**
 * POST /orders
 * Create an order from the shopper's selections. Prices come from the
 * catalogue (never the client), and stock for every stock-tracked item is
 * reserved atomically in the same transaction, so the order can only exist if
 * its stock was available. The reservation is released if the order is
 * cancelled, its payment is cancelled or expires, or it is refunded.
 *
 * If `expectedTotalPence` is sent and the price has changed since the shopper
 * saw it, the order is refused with 409 PRICE_CHANGED and the new quote.
 */
orderRoutes.post("/", async (c) => {
    const user = c.get("user");
    const userId = user.id;
    const idempotencyKeyStr = c.req.header("Idempotency-Key");
    if (!idempotencyKeyStr) {
        return c.json({ error: "Missing Idempotency-Key" }, 400);
    }
    const parsed = validateRequest(createOrderSchema, await c.req.json().catch(() => undefined));
    if (!parsed.success) {
        return c.json({ error: "Please check your details", errors: parsed.errors }, 400);
    }
    const { shipping, items, promoCode, expectedTotal } = parsed.data;
    const existingKey = await db.query.idempotencyKeys.findFirst({
        where: (table, { and, eq }) => and(eq(table.key, idempotencyKeyStr), eq(table.userId, userId)),
    });
    if (existingKey) {
        return c.json({ orderId: existingKey.orderId, reused: true }, 200);
    }
    try {
        const { order, lines } = await db.transaction(async (tx) => {
            const priced = await priceCheckout(tx, {
                items,
                country: shipping.country,
                promoCode: promoCode || undefined,
                userId,
            });
            const { quote: q } = priced;
            if (promoCode && priced.promoError) {
                throw new OrderRejectedError("Promo code rejected", 409, {
                    error: priced.promoError,
                    code: "PROMO_INVALID",
                });
            }
            if (expectedTotal !== undefined && expectedTotal !== q.total) {
                throw new OrderRejectedError("Price changed", 409, {
                    error: "Prices have changed since you started checking out. Please review your new total.",
                    code: "PRICE_CHANGED",
                    quote: quoteResponse(q, priced.lines),
                });
            }
            // Reserve stock for every line before writing anything, collecting all
            // shortfalls so the shopper sees every out-of-stock item at once.
            // Ordered by product so concurrent checkouts lock SKUs in the same
            // order and can't deadlock each other.
            const shortfalls = [];
            const reserved = [];
            for (const line of [...priced.lines].sort((a, b) => a.productId - b.productId)) {
                const reservation = await reserveStock(tx, line.productId, line.quantity);
                if ("shortfall" in reservation)
                    shortfalls.push(reservation.shortfall);
                else
                    reserved.push({ ...line, productItemId: reservation.productItemId });
            }
            if (shortfalls.length)
                throw new OutOfStockError(shortfalls);
            // A fully discounted order has nothing to charge
            const status = q.total === 0 ? "paid" : "pending";
            const [order] = await tx
                .insert(shopOrder)
                .values({
                userId,
                currency: q.currency,
                subtotal: q.subtotal,
                discountTotal: q.discount,
                shippingTotal: q.shipping,
                exportVatRelief: q.exportVatRelief,
                vatTotal: q.vatIncluded,
                total: q.total,
                promotionCode: priced.promotion?.code ?? null,
                status,
                shipping_name: shipping.fullName,
                shipping_email: shipping.email,
                shipping_phone: shipping.phone,
                shipping_address_line1: shipping.address,
                shipping_address_line2: shipping.addressLine2 || null,
                shipping_city: shipping.city,
                shipping_region: shipping.region || "",
                shipping_postal_code: shipping.postalCode,
                shipping_country: shipping.country,
            })
                .returning();
            if (!order)
                throw new Error("Order creation failed: No row returned");
            await tx.insert(orderItems).values(reserved.map((line) => ({
                orderId: order.id,
                productId: line.productId,
                productItemId: line.productItemId,
                productNameSnapshot: line.name,
                unitPrice: line.unitPrice,
                priceAtPurchase: line.unitPrice,
                quantity: line.quantity,
                customizationSnapsot: line.customization,
                measurementSnapshot: line.measurements ?? null,
            })));
            if (priced.promotion) {
                const redeemed = await redeemPromotion(tx, {
                    promotionId: priced.promotion.id,
                    userId,
                    orderId: order.id,
                });
                if (!redeemed) {
                    throw new OrderRejectedError("Promo exhausted", 409, {
                        error: "This promo code has just reached its maximum redemptions",
                        code: "PROMO_INVALID",
                    });
                }
            }
            await tx.insert(idempotencyKeys).values({
                key: idempotencyKeyStr,
                userId,
                orderId: order.id,
            });
            // The order now holds what was in the bag; empty the saved bag too
            const cart = await tx.query.shoppingCart.findFirst({
                where: eq(shoppingCart.userId, userId),
            });
            if (cart)
                await tx
                    .delete(shoppingCartItem)
                    .where(eq(shoppingCartItem.cartId, cart.id));
            return { order, lines: reserved };
        });
        sendConfirmationEmail(order, lines, shipping);
        return c.json({
            orderId: order.id,
            reused: false,
            requiresPayment: order.status === "pending",
        }, 201);
    }
    catch (error) {
        if (error instanceof OutOfStockError) {
            const names = await productNames(error.shortfalls.map((s) => s.productId));
            const outOfStock = error.shortfalls.map((s) => ({
                ...s,
                name: names.get(s.productId) ?? `Product ${s.productId}`,
            }));
            const summary = outOfStock
                .map((i) => i.available > 0 ? `${i.name} (only ${i.available} left)` : i.name)
                .join(", ");
            return c.json({
                error: `Out of stock: ${summary}`,
                code: "OUT_OF_STOCK",
                items: outOfStock,
            }, 409);
        }
        if (error instanceof CheckoutError) {
            return c.json({ error: error.message, code: error.code }, 409);
        }
        if (error instanceof OrderRejectedError) {
            return c.json(error.body, error.status);
        }
        console.error("Failed to create order:", error);
        return c.json({ error: "Failed to create order" }, 500);
    }
});
async function productNames(ids) {
    const rows = await db.query.product.findMany({
        where: (p, { inArray }) => inArray(p.id, ids),
        columns: { id: true, name: true },
    });
    return new Map(rows.map((r) => [r.id, r.name]));
}
/** Fire-and-forget order confirmation; never fails the order. */
function sendConfirmationEmail(order, lines, shipping) {
    const longDate = (d) => d.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const emailData = {
        orderId: order.id,
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        orderDate: longDate(new Date()),
        totalAmount: formatCurrency(order.total, order.currency ?? undefined),
        items: lines.map((line) => ({
            name: line.name,
            quantity: line.quantity,
            price: formatCurrency(line.unitPrice, order.currency ?? undefined),
            customization: [
                ...line.customization.options.map((o) => `${o.group}: ${o.name}`),
                ...line.customization.notes,
                ...(line.customization.size
                    ? [`Size: ${line.customization.size}`]
                    : []),
            ].join(", ") || undefined,
        })),
        shippingAddress: {
            name: shipping.fullName,
            addressLine1: shipping.address,
            addressLine2: shipping.addressLine2,
            city: shipping.city,
            region: shipping.region ?? "",
            postalCode: shipping.postalCode,
            country: shipping.country,
        },
        estimatedDeliveryDate: longDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        tailorNotes: "Your custom suit measurements have been received. Our master tailors will begin crafting your suit within 24 hours.",
    };
    emailService.sendOrderConfirmation(emailData).catch((err) => {
        console.error("Failed to send order confirmation email:", err);
    });
}
/**
 * GET /orders
 */
orderRoutes.get("/", async (c) => {
    const user = c.get("user");
    const orders = await db.query.shopOrder.findMany({
        where: (table, { eq }) => eq(table.userId, user.id),
        orderBy: [desc(shopOrder.id)],
    });
    return c.json({ orders });
});
/**
 * GET /orders/admin/all
 * Fetch all orders (admin use). Returns orders with basic info.
 */
orderRoutes.get("/admin/all", requireAdmin, async (c) => {
    try {
        const orders = await db.query.shopOrder.findMany({
            orderBy: [desc(shopOrder.id)],
            limit: 100,
        });
        return c.json({ success: true, orders });
    }
    catch (error) {
        console.error("Failed to fetch all orders:", error);
        return c.json({ success: false, orders: [], error: "Failed to fetch orders" }, 500);
    }
});
/**
 * GET /orders/:orderId
 */
orderRoutes.get("/:orderId", async (c) => {
    const user = c.get("user");
    const orderId = Number(c.req.param("orderId"));
    // Admins can view any order; customers only their own.
    const order = await db.query.shopOrder.findFirst({
        where: (table, { and, eq }) => user.roles === "ADMIN"
            ? eq(table.id, orderId)
            : and(eq(table.id, orderId), eq(table.userId, user.id)),
        with: {
            items: true, // This works because of our shopOrderRelations
        },
    });
    if (!order)
        return c.json({ error: "Order not found" }, 404);
    return c.json(order);
});
/**
 * PUT /orders/:orderId/status
 * Update order status (admin or system use).
 * Body: { status: string, trackingNumber?: string, trackingCarrier?: string }
 * Sends a status update email to the customer.
 */
orderRoutes.put("/:orderId/status", requireAdmin, async (c) => {
    try {
        const orderId = Number(c.req.param("orderId"));
        const { status, trackingNumber, trackingCarrier } = await c.req.json();
        if (!status) {
            return c.json({ error: "Status is required" }, 400);
        }
        if (!isOrderStatus(status)) {
            return c.json({
                error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(", ")}`,
            }, 400);
        }
        // Fetch the current order
        const order = await db.query.shopOrder.findFirst({
            where: (table, { eq }) => eq(table.id, orderId),
        });
        if (!order) {
            return c.json({ error: "Order not found" }, 404);
        }
        const sameStatus = status === order.status;
        if (!sameStatus && !canTransition(order.status, status)) {
            const allowed = allowedTransitions(order.status);
            return c.json({
                error: `Order is ${order.status} and cannot be moved to ${status}`,
                allowed,
            }, 409);
        }
        // Build update payload
        const updates = { status };
        if (trackingNumber !== undefined)
            updates.tracking_number = trackingNumber;
        if (trackingCarrier !== undefined)
            updates.tracking_carrier = trackingCarrier;
        // Update the order, returning reserved stock when it is cancelled/refunded
        await db.transaction(async (tx) => {
            await tx.update(shopOrder).set(updates).where(eq(shopOrder.id, orderId));
            if (TERMINAL_STATUSES.includes(status)) {
                await releaseOrderStock(tx, orderId);
            }
        });
        // Send status update email (fire and forget)
        if (order.shipping_email) {
            emailService
                .sendOrderStatusUpdate(order.shipping_email, orderId, status, [
                trackingNumber
                    ? `Tracking number: ${trackingNumber}${trackingCarrier ? ` (${trackingCarrier})` : ""}`
                    : "",
                `Your order status has been updated to: ${status.replace(/_/g, " ").toUpperCase()}`,
            ].filter(Boolean))
                .catch((err) => {
                console.error("Failed to send status update email:", err);
            });
        }
        return c.json({
            success: true,
            message: `Order #${orderId} status updated to ${status}`,
        });
    }
    catch (error) {
        console.error("Failed to update order status:", error);
        return c.json({ error: "Failed to update order status" }, 500);
    }
});
