import { Hono, Context } from "hono";
import {
  and,
  customizationOption,
  eq,
  idempotencyKeys,
  inArray,
  isNull,
  orderItems,
  shopOrder,
  product,
  productConfiguration,
  shoppingCart,
  shoppingCartItem,
  productItem,
  db,
} from "@repo/db";
import { getUser } from "@repo/auth";

// Define a typed user object to satisfy TypeScript
type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

const app = new Hono();
app.post("/design/save", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const { productId, selections, measurements, qty } = await c.req.json<{
    productId: number;
    selections: Record<string, number>;
    measurements?: Record<string, string>;
    qty?: number;
  }>();

  // 1️⃣ Validate product
  const productData = await db.query.product.findFirst({
    where: eq(product.id, productId),
  });
  if (!productData || productData.productType !== "CUSTOM") {
    return c.json({ error: "Invalid or non-customizable product" }, 400);
  }

  // 2️⃣ Validate selected options
  const optionIds = Object.values(selections);
  const dbOptions = await db
    .select()
    .from(customizationOption)
    .where(inArray(customizationOption.id, optionIds));

  if (dbOptions.length !== optionIds.length) {
    return c.json({ error: "One or more selected options are invalid" }, 400);
  }

  // 3️⃣ Calculate final price
  const finalPrice =
    Number(productData.basePrice) +
    dbOptions.reduce((sum, opt) => sum + Number(opt.priceDelta), 0);

  const snapshot = dbOptions.reduce((acc: Record<string, any>, opt) => {
    acc[opt.groupId] = {
      id: opt.id,
      label: opt.value,
      price_impact: opt.priceDelta,
    };
    return acc;
  }, {});

  // 4️⃣ Save product configuration
  const [newConfig] = await db
    .insert(productConfiguration)
    .values({
      kindeUserId: user.id,
      productId: productId,
      selectedOptions: snapshot,
      finalPrice: finalPrice.toString(),
      createdAt: new Date(),
    })
    .returning();

  if (!newConfig) return c.json({ error: "Failed to save configuration" }, 500);

  // 5️⃣ Add configuration to cart automatically
  let cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, user.id),
  });
  if (!cart) {
    const [newCart] = await db
      .insert(shoppingCart)
      .values({ userId: user.id })
      .returning();
    cart = newCart;
  }

  const safeQty = Math.max(1, Number(qty) || 1);

  const existingItem = await db.query.shoppingCartItem.findFirst({
    where: and(
      eq(shoppingCartItem.cartId, cart!.id),
      eq(shoppingCartItem.productId, productId),
      eq(shoppingCartItem.configurationId, newConfig.id),
    ),
  });

  if (existingItem) {
    await db
      .update(shoppingCartItem)
      .set({ quantity: existingItem.quantity + safeQty })
      .where(eq(shoppingCartItem.id, existingItem.id));
  } else {
    await db.insert(shoppingCartItem).values({
      cartId: cart!.id,
      productId: productId,
      configurationId: newConfig.id,
      price: finalPrice.toString(),
      quantity: safeQty,
    });
  }

  return c.json({
    success: true,
    configId: newConfig.id,
    finalPrice,
    message: "Design saved and added to cart!",
  });
});
/**
 * Add an item to the user's shopping cart
 */

app.post("/add", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const userId = user.id;

  const body = await c.req.json<{
    productId: number;
    configurationId?: string;
    measurementId?: string;
    qty: number;
  }>();

  const safetyQty = Math.max(1, Number(body.qty) || 1);

  const { productId, configurationId, measurementId } = body;
  // Find the user's cart or create one
  let cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, userId),
  });

  if (!cart) {
    c.json({ error: "Cart not found" }, 400);
    const [newCart] = await db
      .insert(shoppingCart)
      .values({ userId: userId })
      .returning();
    cart = newCart;
    return c.json(cart);
  }
  // Check if the same item (with configuration & measurement) exists
  const existingItem = await db.query.shoppingCartItem.findFirst({
    where: and(
      eq(shoppingCartItem.cartId, cart!.id),
      eq(shoppingCartItem.productId, productId),
      configurationId
        ? eq(shoppingCartItem.configurationId, Number(configurationId))
        : isNull(shoppingCartItem.configurationId),
    ),
  });

  if (existingItem) {
    // Increase quantity

    await db
      .update(shoppingCartItem)
      .set({ quantity: existingItem.quantity + safetyQty })
      .where(eq(shoppingCartItem.id, existingItem.id));
  } else {
    // Insert new cart
    await db.insert(shoppingCartItem).values({
      cartId: cart!.id,
      productId,
      configurationId: configurationId ? Number(configurationId) : null,
      price: "0.00", // Default price, should be calculated from product
      quantity: safetyQty,
    });
  }

  return c.json({ success: true });
});
/**
 * Get current user's cart
 */
app.get("/cart", getUser, async (c: any) => {
  const user = c.get("user") as AuthUser;
  const userId = user.id;

  let cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, userId),
  });

  if (!cart) {
    const inserted = await db
      .insert(shoppingCart)
      .values({ userId: userId })
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
      qty: shoppingCartItem.quantity,
      productName: product.name,
      productImage: product.productImage,
      skuPrice: productItem.price,
      configuration: productConfiguration.selectedOptions,
      configurationPrice: productConfiguration.finalPrice,
      selectedOptions: productConfiguration.selectedOptions,
    })
    .from(shoppingCartItem)
    .leftJoin(
      productConfiguration,
      eq(shoppingCartItem.configurationId, productConfiguration.id),
    )
    .innerJoin(productItem, eq(shoppingCartItem.productItemId, productItem.id))
    .innerJoin(product, eq(productItem.productId, product.id))
    .where(eq(shoppingCartItem.cartId, cart.id));

  let cartTotal = 0;

  const items = rows.map((row: any) => {
    const unitPrice = row.configurationPrice ?? row.skuPrice;

    const totalPrice = Number(unitPrice) * row.qty;
    cartTotal += totalPrice;

    return {
      id: row.itemId,
      product: {
        name: row.productName,
        image: row.productImage,
      },
      configuration: row.configurationId ?? null,
      qty: row.qty,
      unit_price: unitPrice,
      total_price: totalPrice,
      selectedOptions: row.selectedOptions ?? {},
      measurements: row.measurementId ? JSON.parse(row.measurementId) : {},
    };
  });

  return c.json({
    cart_id: cart.id,
    items,
    cart_total: cartTotal,
  });
});

app.post("/checkout", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const userId = user.id;

  const body = await c.req.json<{
    shipping: {
      name: string;
      email: string;
      phone: string;
      address_line1: string;
      address_line2?: string;
      city: string;
      region: string;
      postal_code: string;
      country: string;
    };
  }>();

  const idempotencyKey = c.req.header("Idempotency-Key");
  if (!idempotencyKey) return c.json({ error: "Missing Idempotency-Key" }, 400);

  // Check if key already used
  const existingKey = await db.query.idempotencyKeys.findFirst({
    where: and(
      eq(idempotencyKeys.key, idempotencyKey),
      eq(idempotencyKeys.userId, Number(userId)),
    ),
  });

  if (existingKey)
    return c.json({ orderId: existingKey.orderId, reused: true });
  // 1️⃣ Load user's cart
  const cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, userId),
  });

  if (!cart) return c.json({ error: "Cart not found" }, 400);

  // 2️⃣ Load cart items with configuration prices if available
  const cartItems = await db
    .select({
      itemId: shoppingCartItem.id,
      qty: shoppingCartItem.quantity,
      productId: productItem.productId,
      skuPrice: productItem.price,
      configurationId: shoppingCartItem.configurationId,
      configurationPrice: productConfiguration.finalPrice,
      selectedOptions: productConfiguration.selectedOptions,
    })
    .from(shoppingCartItem)
    .leftJoin(
      productConfiguration,
      eq(shoppingCartItem.configurationId, productConfiguration.id),
    )
    .innerJoin(productItem, eq(shoppingCartItem.productItemId, productItem.id));

  if (cartItems.length === 0) return c.json({ error: "Cart is empty" }, 400);

  // 3️⃣ Calculate total securely
  let total = 0;
  for (const item of cartItems) {
    const unitPrice = item.configurationPrice ?? item.skuPrice;
    total += Number(unitPrice) * item.qty;
  }

  // 4️⃣ Create order with transaction
  const createdOrder = await db.transaction(async (tx) => {
    // a) Insert order
    const [order] = await tx
      .insert(shopOrder)
      .values({
        userId,
        total: total.toString(),
        status: "PENDING_PAYMENT",
        shipping_name: body.shipping.name,
        shipping_email: body.shipping.email,
        shipping_phone: body.shipping.phone,
        shipping_address_line1: body.shipping.address_line1,
        shipping_address_line2: body.shipping.address_line2 ?? null,
        shipping_city: body.shipping.city,
        shipping_region: body.shipping.region,
        shipping_postal_code: body.shipping.postal_code,
        shipping_country: body.shipping.country,
      })
      .returning();

    if (!order) throw new Error("Order creation failed");

    // b) Insert order items
    await tx.insert(orderItems).values(
      cartItems.map((item) => ({
        orderId: order.id,
        productNameSnapshot: "Product", // We need to get actual product name
        priceAtPurchase: (item.configurationPrice ?? item.skuPrice).toString(),
        unitPrice: (item.configurationPrice ?? item.skuPrice).toString(),
        quantity: item.qty,
        customizationSnapsot: item.selectedOptions ?? {},
      })),
    );

    // Save idempotency key
    await tx.insert(idempotencyKeys).values({
      userId: Number(userId),
      key: idempotencyKey,
      orderId: order.id,
    });
    // c) Clear cart items
    await tx
      .delete(shoppingCartItem)
      .where(eq(shoppingCartItem.cartId, cart.id));

    return order;
  });
  // prepare order summary with full product info + snapshot
  const orderSummaryItems = cartItems.map((item) => ({
    productId: item.productId,
    // name: item.productName ??,
    // image: item.productImage,
    configurationId: item.configurationId,
    quantity: item.qty,
    price: item.configurationPrice ?? item.skuPrice,
    total_price: Number(item.configurationPrice ?? item.skuPrice) * item.qty,
    selectedOption: item.selectedOptions ?? {},
    // measurement: item.measurement_id ? JSON.parse(item.measurement_id) : {},
  }));
  return c.json({
    success: true,
    orderId: createdOrder.id,
    total,
    items: orderSummaryItems,
    message: "Order created successfully! Payment pending.",
  });
});

export default app;
