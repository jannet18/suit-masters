import { Hono } from "hono";
import type { AuthContext } from "@repo/auth";
import { db, orderItems, shopOrder } from "@repo/db";
import { eq } from "drizzle-orm";
export const orderRoutes = new Hono<AuthContext>();

/**
 * POST /orders
 * Protected route — user must be logged in
 */
orderRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    const userId = user.id;

    const body = await c.req.json();

    const { items, shipping } = body;
    if (!items || items.length === 0) {
      return c.json({ error: "Cart is empty" }, 400);
    }
    // 🔐 Calculate total safely on backend
    const calculatedTotal = items.reduce((sum: number, item: any) => {
      return sum + Number(item.base_price) * Number(item.quantity);
    }, 0);

    // 1. Destructure the single object directly from the transaction result
    const createdOrder = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(shopOrder)
        .values({
          userId: userId,
          total: calculatedTotal.toString(),
          orderedItems: items.length,
          status: "PENDING",
          shipping_name: shipping.name,
          shipping_email: shipping.email,
          shipping_phone: shipping.phone,
          shipping_address_line1: shipping.addressLine1,
          shipping_address_line2: shipping.addressLine2 ?? null,
          shipping_city: shipping.city,
          shipping_region: shipping.region,
          shipping_postal_code: shipping.postalCode,
          shipping_country: shipping.country,
        })
        .returning();

      if (!newOrder) {
        throw new Error("Failed to create order");
      }

      // 2. Move the items insert INSIDE the transaction block using 'tx' - This ensures that if the items fail, the order is also rolled back
      await tx.insert(orderItems).values(
        items.map((item: any) => ({
          order_id: newOrder.id,
          product_id: item.id,
          quantity: item.quantity,
          base_price: item.base_price.toString(),
          selected_options: JSON.stringify(item.selected_options ?? []),
        })),
      );

      return newOrder;
    });

    // Now createdOrder is the object, and you can access .id safely
    return c.json({ orderId: createdOrder?.id }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

orderRoutes.post("/:orderId/complete", async (c) => {
  const { orderId } = c.req.param();
  try {
    await db
      .update(shopOrder)
      .set({ status: "PAID" })
      .where(eq(shopOrder.id, Number(orderId)));
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to update order" }, 500);
  }
});
