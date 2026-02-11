import { Hono } from "hono";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "../../../packages/auth/src/middleware/authMiddleware";
import { db } from "@repo/db";
import { shoppingCart, shoppingCartItem } from "@repo/db/src/schema/cart";
import {
  product,
  productConfiguration,
  productItem,
} from "@repo/db/src/schema/products";
import { shopOrder } from "@repo/db/src/schema/orders";

const app = new Hono();

app.post("/add", getUser, async (c) => {
  const user = c.get("user");
  const userId = user.id;

  const { product_item_id, configuration_id, measurement_id, qty } =
    await c.req.json<{
      product_item_id: number;
      configuration_id?: string;
      measurement_id?: string;
      qty: number;
    }>();

  let cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.user_id, userId),
  });

  if (!cart) {
    const [newCart] = await db
      .insert(shoppingCart)
      .values({ user_id: userId.toString() })
      .returning();
    cart = newCart;
  }

  const existingItem = await db.query.shoppingCartItem.findFirst({
    where: and(
      eq(shoppingCartItem.cart_id, cart.id),
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
    await db
      .update(shoppingCartItem)
      .set({ qty: existingItem.qty + qty })
      .where(eq(shoppingCartItem.id, existingItem.id));
  } else {
    await db.insert(shoppingCartItem).values({
      cart_id: cart.id,
      product_item_id,
      configuration_id: configuration_id || null,
      measurement_id: measurement_id || null,
      qty,
    });
  }

  return c.json({ success: true });
});

app.get("/cart", getUser, async (c) => {
  const user = c.get("user");
  const userId = user.id;
  // const userId = c.get("user").dbUser.id;

  const cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.user_id, userId),
  });

  if (!cart) {
    return c.json({
      cart_id: null,
      items: [],
      cart_total: 0,
    });
  }

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

app.post("/checkout", getUser, async (c) => {
  // const userId = c.get("user").dbUser.id;
  const user = c.get("user");
  const userId = user.id;

  // 1. Load cart
  const cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.user_id, userId),
  });

  if (!cart) {
    return c.json({ error: "Cart not found" }, 400);
  }

  // 2. Load cart items
  const rows = await db
    .select({
      qty: shoppingCartItem.qty,
      skuPrice: productItem.price,
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
    .where(eq(shoppingCartItem.cart_id, cart.id));

  if (rows.length === 0) {
    return c.json({ error: "Cart is empty" }, 400);
  }

  // 3. Calculate total
  let total = 0;
  for (const row of rows) {
    const unitPrice = row.configurationPrice ?? row.skuPrice;
    total += Number(unitPrice) * row.qty;
  }

  // 4. Create order
  const [order] = await db
    .insert(shopOrder)
    .values({
      userId: userId.toString(),
      total: total.toString(),
    })
    .returning();

  // 5. Clear cart items
  await db
    .delete(shoppingCartItem)
    .where(eq(shoppingCartItem.cart_id, cart.id));

  return c.json({
    order_id: order.id,
    total,
    message: "Order created (payment pending)",
  });
});

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
