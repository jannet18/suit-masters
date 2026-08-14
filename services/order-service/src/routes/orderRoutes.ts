import { Hono } from "hono";
import type { AuthContext } from "@repo/auth";
import {
  db,
  orderItems,
  productConfiguration,
  shopOrder,
  cartItem, // Updated from CartItem/shoppingCartItem
  idempotencyKeys, // Ensure this matches your schema export
  productItem,
} from "@repo/db";
import { eq, and, desc, sql } from "@repo/db";
import {
  emailService,
  type OrderConfirmationData,
} from "../services/emailService.js";

export const orderRoutes = new Hono<AuthContext>();

const requireAdmin = async (c: any, next: () => Promise<void>) => {
  const user = c.get("user");
  if (!user || (user as { roles?: string })?.roles !== "ADMIN") {
    return c.json({ error: "Access Denied, Unauthorized!" }, 403);
  }
  await next();
};

/**
 * POST /orders
 * Checkout user's cart and create order with idempotency
 */
orderRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    const userId = user?.id ?? null;

    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const idempotencyKeyStr = c.req.header("Idempotency-Key");
    if (!idempotencyKeyStr) {
      return c.json({ error: "Missing Idempotency-Key" }, 400);
    }

    const {shipping} = await c.req.json()
    if(!shipping) {
      return c.json({ error: "Shipping details required" }, 400);
    }

    // 1. Transaction enclosed validation & stock reservation
    let userCartItems: Array<{
      id: number;
      qty: number;
      configurationId: number | null;
      productId: number;
      finalPrice: string | number;
      selectedOptions?: unknown | null;
    }> = [];
    let totalAmount = 0;

    const existingKey = await db.query.idempotencyKeys.findFirst({
      where: (table: any, { and, eq }: any) =>
        and(eq(table.key, idempotencyKeyStr), eq(table.userId, userId)),
    });

    if (existingKey) {
      return c.json({ orderId: existingKey.orderId, reused: true }, 200);
    }

    const createdOrder = await db.transaction(async (tx) => {
      // We join productConfiguration to get the 'Build' price and options
      userCartItems = await db
        .select({
          id: cartItem.id,
          qty: cartItem.quantity,
          configurationId: cartItem.configurationId,
          productId: cartItem.productId,
          finalPrice: productConfiguration.finalPrice,
          selectedOptions: productConfiguration.selectedOptions,
        })
        .from(cartItem)
        .innerJoin(
          productConfiguration,
          eq(cartItem.configurationId, productConfiguration.id),
        )
        .where(eq(cartItem.userId, userId));

    if (userCartItems.length === 0) throw new Error("Cart is empty");

    // Verify and lock rows for standard items
    for (const item of userCartItems) {
      // Check if any productItem exists for this product (standard items have SKUs)
      const stockItems = await tx.execute(sql`SELECT id, stoclk FROM product_item WHERE product_id = ${item.productId} FOR UPDATE`)
      
      const totalAvalableStock = stockItems.rows.reduce((sum: number, row: any) => sum + (row.stock ?? 0), 0);
      if (totalAvalableStock < item.qty) {
        throw new Error(`Insufficient stock for product ${item.productId}. Available: ${totalAvalableStock}, requested: ${item.qty}`);
      }
    }

    // Calculate total before transaction for email
    totalAmount = userCartItems.reduce((acc, item) => {
      return acc + Number(item.finalPrice) * item.qty;
    }, 0);

    // Create the Shop Order
    const [newOrder] = await tx
      .insert(shopOrder)
      .values({
        userId,
        total: totalAmount.toFixed(2),
        status: "pending", // Matches our orderStatusEnum
        shipping_name: shipping.name,
        shipping_email: shipping.email,
        shipping_phone: shipping.phone,
        shipping_address_line1: shipping.addressLine1,
        shipping_address_line2: shipping.addressLine2,  
      shipping_city: shipping.city,
      shipping_region: shipping.region,
      shipping_postal_code: shipping.postalCode,
      shipping_country: shipping.country,
    })
    .returning();

    if (!newOrder) {
      throw new Error("Order creation failed: No row returned");
    }

    // Create Order Items (Snapshots)
    await tx.insert(orderItems).values(
      userCartItems.map((item) => ({
        orderId: newOrder.id,
        productNameSnapshot: "Custom Suit Item", // You can join 'product' to get the actual name
        unitPrice: String(item.finalPrice),
        priceAtPurchase: String(item.finalPrice),
        quantity: item.qty,
        customizationSnapsot: item.selectedOptions,
      })),
    );

    // Record Idempotency
    await tx.insert(idempotencyKeys).values({
      key: idempotencyKeyStr,
      userId,
      orderId: newOrder.id,
    });

    // Decrement inventory for STANDARD products (stock-tracked items)
    for (const item of userCartItems) {
      const stockItems = await tx
        .select()
        .from(productItem)
        .where(eq(productItem.productId, item.productId));

      if (stockItems.length > 0) {
        // Decrement stock proportionally across available SKUs
        let remaining = item.qty;
        for (const si of stockItems) {
          if (remaining <= 0) break;
          const decrement = Math.min(si.stock ?? 0, remaining);
          await tx
            .update(productItem)
            .set({ stock: (si.stock ?? 0) - decrement })
            .where(eq(productItem.id, si.id));
          remaining -= decrement;
        }
        if (remaining > 0) {
          throw new Error(
            `Inventory insufficient during checkout for product`,
          );
        }
      }
    }

    // Clear Cart
    await tx.delete(cartItem).where(eq(cartItem.userId, userId));

    return newOrder;
  });

  // Send order confirmation email (fire and forget - don't block response)
  try {
    const emailData: OrderConfirmationData = {
      orderId: createdOrder.id,
      customerName: shipping.name,
      customerEmail: shipping.email,
      orderDate: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      totalAmount: `$${totalAmount.toFixed(2)}`,
      items: userCartItems.map((item) => ({
        name: "Custom Suit",
        quantity: item.qty,
        price: `$${Number(item.finalPrice).toFixed(2)}`,
        customization: item.selectedOptions
          ? JSON.stringify(item.selectedOptions)
          : undefined,
      })),
      shippingAddress: {
        name: shipping.name,
        addressLine1: shipping.addressLine1,
        addressLine2: shipping.addressLine2,
        city: shipping.city,
        region: shipping.region,
        postalCode: shipping.postalCode,
        country: shipping.country,
      },
      estimatedDeliveryDate: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      tailorNotes:
        "Your custom suit measurements have been received. Our master tailors will begin crafting your suit within 24 hours.",
    };

    // Send email asynchronously (don't await - fire and forget)
    emailService.sendOrderConfirmation(emailData).catch((err) => {
      console.error("Failed to send order confirmation email:", err);
      // Don't fail the order if email fails
    });
  } catch (emailError) {
    console.error("Error preparing email data:", emailError);
    // Don't fail the order if email preparation fails
  }

  return c.json({ orderId: createdOrder.id, reused: false }, 201);
} catch (error) {
  console.error(error);
  return c.json({ error: "Failed to create order" }, 500);
}   
})

//         .select()
//         .from(productItem)
//         .where(eq(productItem.productId, item.productId));

//       // If the product has stock-tracked items, verify availability
//       if (stockItems.length > 0) {
//         const totalStock = stockItems.reduce((sum, si) => sum + (si.stock ?? 0), 0);
//         if (totalStock < item.qty) {
//           return c.json(
//             {
//               error: `Insufficient stock for product. Available: ${totalStock}, requested: ${item.qty}`,
//             },
//             400,
//           );
//         }
//       }
//     }

//     // Calculate total before transaction for email
//     const totalAmount = userCartItems.reduce((acc, item) => {
//       return acc + Number(item.finalPrice) * item.qty;
//     }, 0);

//     // 3. Transactional Checkout
//     const createdOrder = await db.transaction(async (tx) => {
//       // Create the Shop Order
//       const [newOrder] = await tx
//         .insert(shopOrder)
//         .values({
//           userId,
//           total: totalAmount.toFixed(2),
//           status: "pending", // Matches our orderStatusEnum
//           shipping_name: shipping.name,
//           shipping_email: shipping.email,
//           shipping_phone: shipping.phone,
//           shipping_address_line1: shipping.addressLine1,
//           shipping_address_line2: shipping.addressLine2,
//           shipping_city: shipping.city,
//           shipping_region: shipping.region,
//           shipping_postal_code: shipping.postalCode,
//           shipping_country: shipping.country,
//         })
//         .returning();

//       if (!newOrder) {
//         throw new Error("Order creation failed: No row returned");
//       }
//       // Create Order Items (Snapshots)
//       await tx.insert(orderItems).values(
//         userCartItems.map((item) => ({
//           orderId: newOrder.id,
//           productNameSnapshot: "Custom Suit Item", // You can join 'product' to get the actual name
//           unitPrice: item.finalPrice,
//           priceAtPurchase: item.finalPrice,
//           quantity: item.qty,
//           customizationSnapsot: item.selectedOptions,
//         })),
//       );

//       // Record Idempotency
//       await tx.insert(idempotencyKeys).values({
//         key: idempotencyKeyStr,
//         userId: Number(userId),
//         orderId: newOrder.id,
//       });

//       // Decrement inventory for STANDARD products (stock-tracked items)
//       for (const item of userCartItems) {
//         const stockItems = await tx
//           .select()
//           .from(productItem)
//           .where(eq(productItem.productId, item.productId));

//         if (stockItems.length > 0) {
//           // Decrement stock proportionally across available SKUs
//           let remaining = item.qty;
//           for (const si of stockItems) {
//             if (remaining <= 0) break;
//             const decrement = Math.min(si.stock ?? 0, remaining);
//             await tx
//               .update(productItem)
//               .set({ stock: (si.stock ?? 0) - decrement })
//               .where(eq(productItem.id, si.id));
//             remaining -= decrement;
//           }
//           if (remaining > 0) {
//             throw new Error(
//               `Inventory insufficient during checkout for product`,
//             );
//           }
//         }
//       }

//       // Clear Cart
//       await tx.delete(cartItem).where(eq(cartItem.userId, userId));

//       return newOrder;
//     });

//     // Send order confirmation email (fire and forget - don't block response)
//     try {
//       const emailData: OrderConfirmationData = {
//         orderId: createdOrder.id,
//         customerName: shipping.name,
//         customerEmail: shipping.email,
//         orderDate: new Date().toLocaleDateString("en-US", {
//           weekday: "long",
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         totalAmount: `$${totalAmount.toFixed(2)}`,
//         items: userCartItems.map((item) => ({
//           name: "Custom Suit",
//           quantity: item.qty,
//           price: `$${Number(item.finalPrice).toFixed(2)}`,
//           customization: item.selectedOptions
//             ? JSON.stringify(item.selectedOptions)
//             : undefined,
//         })),
//         shippingAddress: {
//           name: shipping.name,
//           addressLine1: shipping.addressLine1,
//           addressLine2: shipping.addressLine2,
//           city: shipping.city,
//           region: shipping.region,
//           postalCode: shipping.postalCode,
//           country: shipping.country,
//         },
//         estimatedDeliveryDate: new Date(
//           Date.now() + 14 * 24 * 60 * 60 * 1000,
//         ).toLocaleDateString("en-US", {
//           weekday: "long",
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         tailorNotes:
//           "Your custom suit measurements have been received. Our master tailors will begin crafting your suit within 24 hours.",
//       };

//       // Send email asynchronously (don't await - fire and forget)
//       emailService.sendOrderConfirmation(emailData).catch((err) => {
//         console.error("Failed to send order confirmation email:", err);
//         // Don't fail the order if email fails
//       });
//     } catch (emailError) {
//       console.error("Error preparing email data:", emailError);
//       // Don't fail the order if email preparation fails
//     }

//     return c.json({ orderId: createdOrder.id, reused: false }, 201);
//   } catch (error) {
//     console.error(error);
//     return c.json({ error: "Checkout failed" }, 500);
//   }
// });

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
 * GET /orders/:orderId
 */
orderRoutes.get("/:orderId", async (c) => {
  const user = c.get("user");
  const orderId = Number(c.req.param("orderId"));
  const isAdmin = (user as { roles?: string })?.roles === "ADMIN";

  const order = await db.query.shopOrder.findFirst({
    where: (table, { and, eq }) =>
      isAdmin ? eq(table.id, orderId) : and(eq(table.id, orderId), eq(table.userId, user.id)),
    with: {
      items: true, // This works because of our shopOrderRelations
    },
  });

  if (!order) return c.json({ error: "Order not found" }, 404);
  return c.json(order);
});

/**
 * PUT /orders/:orderId/status
 * Update order status (admin or system use).
 * Body: { status: string, trackingNumber?: string, trackingCarrier?: string }
 * Sends a status update email to the customer.
 */
orderRoutes.put("/:orderId/status", async (c) => {
  try {
    const user = c.get("user");
    const isAdmin = (user as { roles?: string })?.roles === "ADMIN";
    if (!isAdmin) {
      return c.json({ error: "Access Denied, Unauthorized!" }, 403);
    }
    const orderId = Number(c.req.param("orderId"));
    const { status, trackingNumber, trackingCarrier } = await c.req.json<{
      status: string;
      trackingNumber?: string;
      trackingCarrier?: string;
    }>();

    if (!status) {
      return c.json({ error: "Status is required" }, 400);
    }

    // Valid status transitions
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "in_production",
      "quality_check",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!validStatuses.includes(status)) {
      return c.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        400,
      );
    }

    // Fetch the current order
    const order = await db.query.shopOrder.findFirst({
      where: (table, { eq }) => eq(table.id, orderId),
    });

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    // Build update payload
    const updates: Record<string, any> = { status };
    if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
    if (trackingCarrier !== undefined) updates.tracking_carrier = trackingCarrier;

    // Update the order
    await db
      .update(shopOrder)
      .set(updates)
      .where(eq(shopOrder.id, orderId));

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
  } catch (error) {
    console.error("Failed to update order status:", error);
    return c.json({ error: "Failed to update order status" }, 500);
  }
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
      with: { items: true },
    });

    return c.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        userId: o.userId,
        total: o.total,
        status: o.status,
        customerName: o.shipping_name,
        customerEmail: o.shipping_email,
        orderedItems: o.items.length,
        createdAt: o.createdAt,
        estimatedDeliveryDate: o.estimated_delivery_date,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch all orders:", error);
    return c.json({ success: false, orders: [], error: "Failed to fetch orders" }, 500);
  }
});

/**
 * GET /orders/admin/stats
 * Aggregate order data for the admin dashboard.
 */
orderRoutes.get("/admin/stats", requireAdmin, async (c) => {
  try {
    const revenueByMonthResult = await db.execute(sql`
      SELECT to_char(date_trunc('month', created_at), 'Mon') as month,
             count(*)::int as total,
             count(*) filter (where status = 'paid')::int as successful
      FROM shop_order
      WHERE created_at >= now() - interval '6 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `);

    const ordersByStatusResult = await db.execute(sql`
      SELECT status, count(*)::int as count
      FROM shop_order
      GROUP BY status
      ORDER BY count DESC
    `);

    const recentOrders = await db.query.shopOrder.findMany({
      orderBy: [desc(shopOrder.id)],
      limit: 5,
    });

    return c.json({
      success: true,
      revenueByMonth: revenueByMonthResult.rows,
      ordersByStatus: ordersByStatusResult.rows,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.shipping_name,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch order stats:", error);
    return c.json(
      { success: false, revenueByMonth: [], ordersByStatus: [], recentOrders: [], error: "Failed to fetch stats" },
      500,
    );
  }
});

/**
 * POST /orders/admin/create
 * Admin manually creates an order for a customer (e.g. phone/in-store orders).
 * Prices are always resolved server-side from the product catalog, never
 * trusted from the client.
 */
orderRoutes.post("/admin/create", requireAdmin, async (c) => {
  try {
    const body = await c.req.json<{
      userId: string;
      status?: string;
      shipping: {
        name: string;
        email: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        region: string;
        postalCode: string;
        country: string;
      };
      items: { productId: number; quantity: number }[];
    }>();

    const { userId, status, shipping, items } = body;

    if (!userId || !shipping || !items || items.length === 0) {
      return c.json({ error: "userId, shipping, and at least one item are required" }, 400);
    }

    const customer = await db.query.usersTable.findFirst({
      where: (table, { eq: eqFn }) => eqFn(table.id, userId),
    });
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    const productIds = items.map((i) => i.productId);
    const products = await db.query.product.findMany({
      where: (table, { inArray }) => inArray(table.id, productIds),
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return c.json({ error: `Product ${item.productId} not found` }, 404);
      }
      if (!item.quantity || item.quantity < 1) {
        return c.json({ error: "Item quantity must be at least 1" }, 400);
      }
    }

    const total = items.reduce((sum, item) => {
      const p = productMap.get(item.productId)!;
      return sum + Number(p.basePrice) * item.quantity;
    }, 0);

    const createdOrder = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(shopOrder)
        .values({
          userId,
          total: total.toFixed(2),
          status: status || "pending",
          shipping_name: shipping.name,
          shipping_email: shipping.email,
          shipping_phone: shipping.phone,
          shipping_address_line1: shipping.addressLine1,
          shipping_address_line2: shipping.addressLine2,
          shipping_city: shipping.city,
          shipping_region: shipping.region,
          shipping_postal_code: shipping.postalCode,
          shipping_country: shipping.country,
        })
        .returning();

      if (!newOrder) throw new Error("Order creation failed: No row returned");

      await tx.insert(orderItems).values(
        items.map((item) => {
          const p = productMap.get(item.productId)!;
          return {
            orderId: newOrder.id,
            productId: p.id,
            productNameSnapshot: p.name,
            unitPrice: p.basePrice,
            priceAtPurchase: p.basePrice,
            quantity: item.quantity,
          };
        }),
      );

      return newOrder;
    });

    return c.json({ success: true, orderId: createdOrder.id }, 201);
  } catch (error) {
    console.error("Failed to create order:", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});