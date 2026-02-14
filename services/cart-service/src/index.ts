import { Hono } from "hono";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "../../../packages/auth/src/middleware/authMiddleware";
import {
  db,
  product,
  productConfiguration,
  productItem,
  shopOrder,
  shoppingCart,
  shoppingCartItem,
} from "@repo/db";

// Define a typed user object to satisfy TypeScript
type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

const app = new Hono();
/**
 * Add an item to the user's shopping cart
 */

app.post("/add", getUser, async (c) => {
  // const user = c.get("user") as { id: string; [key: string]: any };
  const user = c.get("user") as AuthUser;
  const userId = user.id;

  const body = await c.req.json<{
    product_item_id: number;
    configuration_id?: string;
    measurement_id?: string;
    qty: number;
  }>();

  const safetyQty = Math.max(1, Number(body.qty) || 1);

  const { product_item_id, configuration_id, measurement_id } = body;
  // Find the user's cart or create one
  let cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.user_id, userId),
  });

  if (!cart) return c.json({ error: "Cart not found" }, 400);
  const [newCart] = await db
    .insert(shoppingCart)
    .values({ user_id: userId })
    .returning();
  cart = newCart;
  // Check if the same item (with configuration & measurement) exists
  const existingItem = await db.query.shoppingCartItem.findFirst({
    where: and(
      eq(shoppingCartItem.cart_id, cart!.id),
      eq(shoppingCartItem.product_item_id, product_item_id),
      configuration_id
        ? eq(shoppingCartItem.configuration_id, configuration_id)
        : isNull(shoppingCartItem.configuration_id),
      measurement_id
        ? eq(shoppingCartItem.measurement_id, measurement_id)
        : isNull(shoppingCartItem.measurement_id),
    ),
  });

  if (existingItem) {
    // Increase quantity

    await db
      .update(shoppingCartItem)
      .set({ qty: existingItem.qty + safetyQty })
      .where(eq(shoppingCartItem.id, existingItem.id));
  } else {
    // Insert new cart
    await db.insert(shoppingCartItem).values({
      cart_id: cart!.id,
      product_item_id,
      configuration_id: configuration_id || null,
      measurement_id: measurement_id || null,
      qty: safetyQty,
    });
  }

  return c.json({ success: true });
});
/**
 * Get current user's cart
 */
app.get("/cart", getUser, async (c) => {
  const user = c.get("user") as AuthUser;
  const userId = user.id;

  let cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.user_id, userId),
  });

  if (!cart) {
    const inserted = await db
      .insert(shoppingCart)
      .values({ user_id: userId })
      .returning();

    cart = inserted[0];
  }
  if (!cart) {
    return c.json({
      cart_id: null,
      items: [],
      cart_total: 0,
    });
  }

  // Join cart items with product & configuration details
  const rows = await db
    .select({
      itemId: shoppingCartItem.id,
      qty: shoppingCartItem.qty,
      productName: product.name,
      productImage: product.product_image,
      skuPrice: productItem.price,
      configuration: productConfiguration.selected_options,
      configurationPrice: productConfiguration.final_price,
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
    .innerJoin(product, eq(productItem.product_id, product.id))
    .where(eq(shoppingCartItem.cart_id, cart.id));

  let cartTotal = 0;

  const items = rows.map((row) => {
    const unitPrice = row.configurationPrice ?? row.skuPrice;

    const totalPrice = Number(unitPrice) * row.qty;
    cartTotal += totalPrice;

    return {
      id: row.itemId,
      product: {
        name: row.productName,
        image: row.productImage,
      },
      configuration: row.configuration ?? null,
      qty: row.qty,
      unit_price: unitPrice,
      total_price: totalPrice,
    };
  });

  return c.json({
    cart_id: cart.id,
    items,
    cart_total: cartTotal,
  });
});

/**
 * Checkout the user's cart and create an order
 */
// app.post("/checkout", getUser, async (c) => {
//   const user = c.get("user") as AuthUser;
//   const userId = user.id;

//   // 1. Load cart
//   const cart = await db.query.shoppingCart.findFirst({
//     where: eq(shoppingCart.user_id, userId),
//   });

//   if (!cart) {
//     return c.json({ error: "Cart not found" }, 400);
//   }

//   // 2. Load cart items
//   const cartItems = await db
//     .select({
//       qty: shoppingCartItem.qty,
//       skuPrice: productItem.price,
//       configurationPrice: productConfiguration.final_price,
//     })
//     .from(shoppingCartItem)
//     .leftJoin(
//       productConfiguration,
//       eq(shoppingCartItem.configuration_id, productConfiguration.id),
//     )
//     .innerJoin(
//       productItem,
//       eq(shoppingCartItem.product_item_id, productItem.id),
//     )
//     .where(eq(shoppingCartItem.cart_id, cart.id));

//   if (cartItems.length === 0) {
//     return c.json({ error: "Cart is empty" }, 400);
//   }

//   // 3. Calculate total
//   let total = 0;
//   for (const item of cartItems) {
//     const unitPrice = item.configurationPrice ?? item.skuPrice;
//     total += Number(unitPrice) * item.qty;
//   }

//   // 4. Create order
//   const { shipping } = await c.req.json<{
//     shipping: {
//       name: string;
//       email: string;
//       phone: string;
//       address_line1: string;
//       address_line2?: string;
//       city: string;
//       region: string;
//       postal_code: string;
//       country: string;
//     };
//   }>();
//   const [order] = await db
//     .insert(shopOrder)
//     .values({
//       userId: userId.toString(),
//       total: total.toString(),
//       orderedItems: cartItems.length,
//       status: "PENDING",

//       shipping_name: shipping.name,
//       shipping_email: shipping.email,
//       shipping_phone: shipping.phone,

//       shipping_address_line1: shipping.address_line1,
//       shipping_address_line2: shipping.address_line2 ?? null,
//       shipping_city: shipping.city,
//       shipping_region: shipping.region,
//       shipping_postal_code: shipping.postal_code,
//       shipping_country: shipping.country,
//     })
//     .returning();

//   // 5. Clear cart items
//   if (!cart) throw new Error("Cart not found");

//   await db
//     .delete(shoppingCartItem)
//     .where(eq(shoppingCartItem.cart_id, cart.id));

//   return c.json({
//     order_id: order.id,
//     total,
//     message: "Order created (payment pending)",
//   });
// });

// app.post("/checkout", getUser, async (c) => {
//   const user = c.get("user") as { id: string };
//   const userId = user.id;

//   const body = await c.req.json<{
//     shipping: {
//       name: string;
//       email: string;
//       phone: string;
//       address_line1: string;
//       address_line2?: string;
//       city: string;
//       region: string;
//       postal_code: string;
//       country: string;
//     };
//   }>();

//   // 1️⃣ Load cart
//   const cart = await db.query.shoppingCart.findFirst({
//     where: eq(shoppingCart.user_id, userId),
//   });

//   if (!cart) {
//     return c.json({ error: "Cart not found" }, 400);
//   }

//   // From this point onward, cart is guaranteed
//   const cartId = cart.id;

//   // 2️⃣ Load cart items
//   const cartItems = await db
//     .select({
//       qty: shoppingCartItem.qty,
//       skuPrice: productItem.price,
//       configurationPrice: productConfiguration.final_price,
//     })
//     .from(shoppingCartItem)
//     .leftJoin(
//       productConfiguration,
//       eq(shoppingCartItem.configuration_id, productConfiguration.id),
//     )
//     .innerJoin(
//       productItem,
//       eq(shoppingCartItem.product_item_id, productItem.id),
//     )
//     .where(eq(shoppingCartItem.cart_id, cartId));

//   if (cartItems.length === 0) {
//     return c.json({ error: "Cart is empty" }, 400);
//   }

//   // 3️⃣ Calculate total
//   let total = 0;
//   for (const item of cartItems) {
//     const unitPrice = item.configurationPrice ?? item.skuPrice;
//     total += Number(unitPrice) * item.qty;
//   }

//   // 4️⃣ Create order
//   const inserted = await db
//     .insert(shopOrder)
//     .values({
//       userId: userId,
//       total: total.toString(),
//       orderedItems: cartItems.length,
//       status: "PENDING",

//       shipping_name: body.shipping.name,
//       shipping_email: body.shipping.email,
//       shipping_phone: body.shipping.phone,

//       shipping_address_line1: body.shipping.address_line1,
//       shipping_address_line2: body.shipping.address_line2 ?? null,
//       shipping_city: body.shipping.city,
//       shipping_region: body.shipping.region,
//       shipping_postal_code: body.shipping.postal_code,
//       shipping_country: body.shipping.country,
//     })
//     .returning();

//   // Drizzle returns array — make it explicit
//   const order = inserted[0];

//   if (!order) {
//     return c.json({ error: "Failed to create order" }, 500);
//   }

//   // 5️⃣ Clear cart
//   await db.delete(shoppingCartItem).where(eq(shoppingCartItem.cart_id, cartId));

//   return c.json({
//     order_id: order.id,
//     total,
//     message: "Order created (payment pending)",
//   });
// });

// app.get("/orders", getUser, async (c) => {
//   const userId = c.get("user").dbUser.id;

//   const orders = await db
//     .select({
//       id: shopOrder.id,
//       total: shopOrder.total,
//       order_date: shopOrder.order_date,
//     })
//     .from(shopOrder)
//     .where(eq(shopOrder.user_id, userId))
//     .orderBy(desc(shopOrder.order_date));

//   return c.json(
//     orders.map((order) => ({
//       ...order,
//       status: "PENDING_PAYMENT",
//     }))
//   );
// });

export default app;
