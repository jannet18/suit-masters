import { Hono } from "hono";
import type { AuthContext } from "@repo/auth";
import {
  db,
  orderItems,
  productConfiguration,
  productItem,
  shopOrder,
  shoppingCartItem,
  idempotencyKeys,
} from "@repo/db";
import { eq, and, desc } from "@repo/db";

export const orderRoutes = new Hono<AuthContext>();

/**
 * POST /orders
 * Protected route — user must be logged in
 * Checkout user's cart and create order with idempotency
 */
orderRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    const userId = user?.id ?? null;

    // Get Idempotency Key
    const idempotencyKey = c.req.header("Idempotency-Key");
    if (!idempotencyKey) {
      return c.json({ error: "Missing Idempotency-Key" }, 400);
    }

    // Check if key already used
    const existingKey = await db.query.idempotencyKeys.findFirst({
      where: (keys, { and, eq }) =>
        and(
          eq(keys.key, idempotencyKey),
          eq(keys.userId, Number(userId) ?? -1),
        ),
    });

    if (existingKey) {
      return c.json({
        orderId: existingKey.orderId,
        reused: true,
      });
    }

    const { shipping } = await c.req.json();
    if (!shipping) {
      return c.json({ error: "Shipping info required" }, 400);
    }
    // 1 Check for existing unpaid order
    // const existingPendingOrder = await db.query.shopOrder.findFirst({
    //   where: (orders, { and, eq }) =>
    //     and(eq(orders.userId, userId), eq(orders.status, "PENDING_PAYMENT")),
    // });
    // if (existingPendingOrder) {
    //   return c.json({ orderId: existingPendingOrder.id, reused: true });
    // }
    // 2 Load user's cart
    const cart = await db.query.shoppingCart.findFirst({
      where: (cart, { eq }) => eq(cart.user_id, userId),
    });

    if (!cart) {
      return c.json({ error: "Cart not found" }, 400);
    }

    // 3 Load cart items with pricing
    const cartItems = await db
      .select({
        id: shoppingCartItem.id,
        qty: shoppingCartItem.qty,
        skuPrice: productItem.price,
        configurationPrice: productConfiguration.final_price,
        productId: productItem.product_id,
        selectedOptions: productConfiguration.selected_options,
        configurationId: shoppingCartItem.configuration_id,
      })
      .from(shoppingCartItem)
      .leftJoin(
        productConfiguration,
        eq(shoppingCartItem.configuration_id, productConfiguration.id),
      )
      .innerJoin(
        productItem,
        eq(shoppingCartItem.product_item_id, productItem.id),
      )
      .where(eq(shoppingCartItem.cart_id, cart.id));

    if (cartItems.length === 0) {
      return c.json({ error: "Cart is empty" }, 400);
    }

    // 4 Securely calculate total from DB
    let total = 0;

    for (const item of cartItems) {
      const unitPrice = item.configurationPrice ?? item.skuPrice;
      total += Number(unitPrice) * item.qty;
    }

    // 5 Create order inside transaction
    const createdOrder = await db.transaction(async (tx) => {
      const total = cartItems.reduce((acc, item) => {
        const price = item.configurationPrice ?? item.skuPrice;
        return acc + Number(price) * item.qty;
      }, 0);

      const [newOrder] = await tx
        .insert(shopOrder)
        .values({
          userId,
          total: total.toString(),
          orderedItems: cartItems.length,
          status: "PENDING_PAYMENT",
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

      if (!newOrder) throw new Error("Order creation failed");

      // 6 Move cart items → orderItems
      await tx.insert(orderItems).values(
        cartItems.map((item) => ({
          order_id: newOrder.id,
          product_id: item.productId,
          configuration_id: item.configurationId ?? null,
          quantity: item.qty,
          base_price: (item.configurationPrice ?? item.skuPrice).toString(),
          selected_options: JSON.stringify(item.selectedOptions ?? {}),
        })),
      );

      // insert used idempotency key for auditing
      await tx.insert(idempotencyKeys).values({
        key: idempotencyKey,
        userId: Number(userId),
        orderId: newOrder.id,
        createdAt: new Date(),
      });
      // 7 Clear cart
      await tx
        .delete(shoppingCartItem)
        .where(eq(shoppingCartItem.cart_id, cart.id));

      return newOrder;
    });

    return c.json({ orderId: createdOrder.id, reused: false }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// orderRoutes.post("/", async (c) => {
//   try {
//     const user = c.get("user");
//     const userId = Number(user?.id) ?? null;

//     // --- IDEMPOTENCY CHECK ---
//     const idempotencyKey = c.req.header("Idempotency-Key");
//     if (!idempotencyKey)
//       return c.json({ error: "Missing Idempotency-Key" }, 400);

//     const existingKey = await db.query.idempotencyKeys.findFirst({
//       where: (keys, { and, eq }) =>
//         and(eq(keys.key, idempotencyKey), eq(keys.userId, userId)),
//     });
//     if (existingKey)
//       return c.json({ orderId: existingKey.orderId, reused: true });

//     // --- PAYLOAD VALIDATION ---
//     const { shipping } = await c.req.json();
//     if (!shipping) return c.json({ error: "Shipping info required" }, 400);

//     // --- DATA FETCHING ---
//     const cart = await db.query.shoppingCart.findFirst({
//       where: (cart, { eq }) => eq(cart.user_id, userId),
//     });
//     if (!cart) return c.json({ error: "Cart not found" }, 400);

//     const cartItems = await db
//       .select({
//         id: shoppingCartItem.id,
//         qty: shoppingCartItem.qty,
//         skuPrice: productItem.price,
//         // CRITICAL: We prioritize the custom configuration price for bespoke items
//         configurationPrice: productConfiguration.final_price,
//         productId: productItem.product_id,
//         selectedOptions: productConfiguration.selected_options,
//         configurationId: shoppingCartItem.configuration_id,
//       })
//       .from(shoppingCartItem)
//       .leftJoin(
//         productConfiguration,
//         eq(shoppingCartItem.configuration_id, productConfiguration.id),
//       )
//       .innerJoin(
//         productItem,
//         eq(shoppingCartItem.product_item_id, productItem.id),
//       )
//       .where(eq(shoppingCartItem.cart_id, cart.id));

//     if (cartItems.length === 0) return c.json({ error: "Cart is empty" }, 400);

//     // --- TRANSACTION ---
//     const createdOrder = await db.transaction(async (tx) => {
//       // 1. Calculate Total
//       const total = cartItems.reduce((acc, item) => {
//         const price = item.configurationPrice ?? item.skuPrice;
//         return acc + Number(price) * item.qty;
//       }, 0);

//       // 2. Create Order
//       const [newOrder] = await tx
//         .insert(shopOrder)
//         .values({
//           userId: userId as string,
//           total: total.toFixed(2),
//           status: "PENDING_PAYMENT",
//           shipping_name: shipping.name,
//           shipping_email: shipping.email,
//           shipping_city: shipping.city,
//           shipping_country: shipping.country,
//           shipping_phone: shipping.phone,
//           shipping_address_line1: shipping.address1,
//           shipping_region: shipping.region,
//           shipping_postal_code: shipping.postalCode,
//           // ... other shipping fields
//         })
//         .returning();

//       // 3. Snapshot configurations into orderItems
//       // This is vital: if a user deletes their configuration later, the order stays intact
//       await tx.insert(orderItems).values(
//         cartItems.map((item) => ({
//           order_id: newOrder.id,
//           product_id: item.productId,
//           configuration_id: item.configurationId,
//           quantity: item.qty,
//           base_price: (
//             item.configurationPrice ??
//             item.skuPrice ??
//             0
//           ).toString(),
//           // Snapshotting options as JSONB ensures the tailor always sees what was ordered
//           selected_options: item.selectedOptions,
//           final_price:
//         })),
//       );

//       // 4. Record Idempotency
//       await tx.insert(idempotencyKeys).values({
//         key: idempotencyKey,
//         userId: userId,
//         orderId: newOrder.id,
//       });

//       // 5. Cleanup Cart
//       await tx
//         .delete(shoppingCartItem)
//         .where(eq(shoppingCartItem.cart_id, cart.id));

//       return newOrder;
//     });

//     return c.json({ orderId: createdOrder.id, reused: false }, 201);
//   } catch (error) {
//     return c.json({ error: "Checkout failed" }, 500);
//   }
// });
/**
 * GET /orders
 * Fetch all orders for the current user
 */
orderRoutes.get("/", async (c) => {
  const user = c.get("user");
  const userId = user.id;

  const orders = await db.query.shopOrder.findMany({
    where: (orders: any, { eq }: any) => eq(orders.userId, userId),
    orderBy: (orders: any, { desc }: any) => [desc(orders.orderDate)],
  });
  return c.json({ orders });
});
/**
 * GET /orders/:orderId
 * Fetch a single order for the current user
 */
orderRoutes.get("/:orderId", async (c) => {
  const user = c.get("user");
  const userId = user.id;
  const orderId = Number(c.req.param("orderId"));

  const order = await db.query.shopOrder.findFirst({
    where: (orders: any, { and, eq }: any) =>
      and(eq(orders.id, orderId), eq(orders.userId, userId)),
  });
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }
  return c.json(order);
});
