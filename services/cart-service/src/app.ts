import { Hono, Context } from "hono";
import {
  and,
  customizationGroup,
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
  sql,
} from "@repo/db";
import { getUser, type AuthUser, type AuthEnv } from "@repo/auth";
import {
  errorHandler,
  notFoundHandler,
  createLogger,
  requestLogger,
  createHealthRoutes,
  initSentry,
} from "@repo/error-handling";

const SERVICE_NAME = "cart-service";
process.env.SERVICE_NAME ||= SERVICE_NAME;
initSentry({ serviceName: SERVICE_NAME });
const logger = createLogger(SERVICE_NAME);

interface DesignSaveRequest {
  productId: number;
  selections: Record<string, number>;
  measurements?: Record<string, string>;
  qty?: number;
}

interface AddToCartRequest {
  productId: number;
  configurationId?: string;
  measurementId?: string;
  qty: number;
}

// Money: every price here is integer pence (see @repo/pricing/money).

interface SelectedOptionSnapshot {
  id: number;
  label: string;
  /** pence */
  price_impact: number;
}

interface CartItemRow {
  itemId: number;
  qty: number;
  productName: string | null;
  productImage: string | null;
  /** Line unit price stored when the item was added (pence). */
  linePrice: number;
  configuration?: Record<string, any> | null;
  configurationPrice?: number | null;
  selectedOptions?: Record<string, any> | null;
  configurationId?: number | null;
  measurementId?: string | null;
}

const app = new Hono<AuthEnv>();
app.use(requestLogger(logger));

/**
 * Price a product with the chosen options from the catalogue, in pence.
 * Options are matched by id or value within the product's category; anything
 * that doesn't match is ignored (it carries no price). Returns null if the
 * product doesn't exist or isn't on sale.
 */
async function priceConfiguration(
  productId: number,
  selections: Array<{ id?: number; label?: string }>,
) {
  const productData = await db.query.product.findFirst({
    where: eq(product.id, productId),
  });
  if (!productData || !productData.isActive) return null;

  const categoryOptions = await db
    .select({
      id: customizationOption.id,
      groupId: customizationOption.groupId,
      value: customizationOption.value,
      priceDelta: customizationOption.priceDelta,
    })
    .from(customizationOption)
    .innerJoin(
      customizationGroup,
      eq(customizationOption.groupId, customizationGroup.id),
    )
    .where(eq(customizationGroup.categoryId, productData.categoryId));

  const chosen = selections
    .map((sel) =>
      categoryOptions.find(
        (opt) => opt.id === sel.id || (sel.label && opt.value === sel.label),
      ),
    )
    .filter((opt): opt is (typeof categoryOptions)[number] => !!opt);

  const finalPrice = chosen.reduce(
    (sum, opt) => sum + opt.priceDelta,
    productData.basePrice,
  );
  const snapshot = chosen.reduce<Record<string, SelectedOptionSnapshot>>(
    (acc, opt) => {
      acc[opt.groupId] = {
        id: opt.id,
        label: opt.value ?? "",
        price_impact: opt.priceDelta,
      };
      return acc;
    },
    {},
  );

  return { product: productData, finalPrice, snapshot, matched: chosen.length };
}

// Health check
app.route(
  "/health",
  createHealthRoutes({
    service: SERVICE_NAME,
    checks: {
      database: async () => {
        await db.execute(sql`select 1`);
      },
    },
  }),
);

app.post("/design/save", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const { productId, selections, measurements, qty } =
    await c.req.json<DesignSaveRequest>();

  // 1️⃣ Price the design from the catalogue (only options from this product's category count)
  const optionIds = Object.values(selections) as number[];
  const priced = await priceConfiguration(
    productId,
    optionIds.map((id) => ({ id })),
  );
  if (!priced || priced.product.productType !== "CUSTOM") {
    return c.json({ error: "Invalid or non-customizable product" }, 400);
  }
  if (priced.matched !== optionIds.length) {
    return c.json({ error: "One or more selected options are invalid" }, 400);
  }
  const { finalPrice, snapshot } = priced;

  // 4️⃣ Save product configuration
  const [newConfig] = await db
    .insert(productConfiguration)
    .values({
      userId: user.id,
      productId: productId,
      selectedOptions: snapshot,
      finalPrice,
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
      price: finalPrice,
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

// app.post("/add", getUser, async (c: Context) => {
//   const user = c.get("user") as AuthUser;
//   const userId = user.id;

//   const body = await c.req.json<AddToCartRequest>();

//   const safetyQty = Math.max(1, Number(body.qty) || 1);

//   const { productId, configurationId, measurementId } = body;
//   // Find the user's cart or create one
//   let cart = await db.query.shoppingCart.findFirst({
//     where: eq(shoppingCart.userId, userId),
//   });

//   if (!cart) {
//     const [newCart] = await db
//       .insert(shoppingCart)
//       .values({ userId: userId })
//       .returning();
//     cart = newCart;
//   }
//   // Check if the same item (with configuration & measurement) exists
//   const existingItem = await db.query.shoppingCartItem.findFirst({
//     where: and(
//       eq(shoppingCartItem.cartId, cart!.id),
//       eq(shoppingCartItem.productId, productId),
//       configurationId
//         ? eq(shoppingCartItem.configurationId, Number(configurationId))
//         : isNull(shoppingCartItem.configurationId),
//     ),
//   });

//   if (existingItem) {
//     // Increase quantity

//     await db
//       .update(shoppingCartItem)
//       .set({ quantity: existingItem.quantity + safetyQty })
//       .where(eq(shoppingCartItem.id, existingItem.id));
//   } else {
//     // Insert new cart
//     await db.insert(shoppingCartItem).values({
//       cartId: cart!.id,
//       productId,
//       configurationId: configurationId ? Number(configurationId) : null,
//       price: "0.00", // Default price, should be calculated from product
//       quantity: safetyQty,
//     });
//   }

//   return c.json({ success: true });
// });

app.post("/add", getUser, async (c: Context) => {
  try {
    const user = c.get("user") as AuthUser;
    const userId = user.id;
    const { productId, qty } = await c.req.json<{
      productId: number;
      qty: number;
    }>();
    const safetyQty = Math.max(1, Number(qty) || 1);

    // Fetch master item details to secure pricing
    const ProductData = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });

    if (!ProductData) {
      return c.json({ error: "Product not found" }, 404);
    }

    // Find or create user's cart
    let cart = await db.query.shoppingCart.findFirst({
      where: eq(shoppingCart.userId, userId),
    });

    if (!cart) {
      const [newCart] = await db
        .insert(shoppingCart)
        .values({ userId: userId })
        .returning();
      cart = newCart;
    }

    // Check if the same item exists in the cart
    const existingItem = await db.query.shoppingCartItem.findFirst({
      where: and(
        eq(shoppingCartItem.cartId, cart!.id),
        eq(shoppingCartItem.productId, productId),
        isNull(shoppingCartItem.configurationId), // Standard products have no configuration
      ),
    });
    if (existingItem) {
      await db
        .update(shoppingCartItem)
        .set({ quantity: existingItem.quantity + safetyQty })
        .where(eq(shoppingCartItem.id, existingItem.id));
    } else {
      await db.insert(shoppingCartItem).values({
        cartId: cart!.id,
        productId,
        configurationId: null, // No configuration for standard products
        price: ProductData.basePrice,
        quantity: safetyQty,
      });
    }
    return c.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return c.json({ error: "Failed to add item to cart" }, 500);
  }
});

/**
 * Get current user's cart
 */
app.get("/cart", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const userId = user.id;

  let cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, userId),
  });

  if (!cart) {
    const [inserted] = await db
      .insert(shoppingCart)
      .values({ userId: userId })
      .returning();

    cart = inserted;
  }
  if (!cart) {
    return c.json({
      cart_id: null,
      items: [],
      cart_total: 0,
    });
  }

  // Join cart items with product & configuration details
  const rows = (await db
    .select({
      itemId: shoppingCartItem.id,
      qty: shoppingCartItem.quantity,
      productName: product.name,
      productImage: product.productImage,
      linePrice: shoppingCartItem.price,
      configurationId: shoppingCartItem.configurationId,
      configurationPrice: productConfiguration.finalPrice,
      selectedOptions: productConfiguration.selectedOptions,
    })
    .from(shoppingCartItem)
    .innerJoin(product, eq(shoppingCartItem.productId, product.id))
    .leftJoin(
      productConfiguration,
      eq(shoppingCartItem.configurationId, productConfiguration.id),
    )
    .where(eq(shoppingCartItem.cartId, cart.id))) as CartItemRow[];

  let cartTotal = 0;

  const items = rows.map((row: CartItemRow) => {
    const unitPrice = row.configurationPrice ?? row.linePrice;
    const totalPrice = unitPrice * row.qty;
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

/**
 * Remove an item from the user's shopping cart
 */
app.delete("/remove/:itemId", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const itemId = Number(c.req.param("itemId"));

  const cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, user.id),
  });

  if (!cart) {
    return c.json({ success: false, error: "Cart not found" }, 404);
  }

  // Verify the item belongs to this user's cart
  const item = await db.query.shoppingCartItem.findFirst({
    where: and(
      eq(shoppingCartItem.id, itemId),
      eq(shoppingCartItem.cartId, cart.id),
    ),
  });

  if (!item) {
    return c.json({ success: false, error: "Item not found in cart" }, 404);
  }

  await db.delete(shoppingCartItem).where(eq(shoppingCartItem.id, itemId));

  return c.json({ success: true, message: "Item removed from cart" });
});

/**
 * Update quantity of a cart item
 */
app.put("/update/:itemId", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const itemId = Number(c.req.param("itemId"));
  const { quantity } = await c.req.json<{ quantity: number }>();

  if (!quantity || quantity < 1) {
    return c.json(
      { success: false, error: "Quantity must be at least 1" },
      400,
    );
  }

  const cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, user.id),
  });

  if (!cart) {
    return c.json({ success: false, error: "Cart not found" }, 404);
  }

  const item = await db.query.shoppingCartItem.findFirst({
    where: and(
      eq(shoppingCartItem.id, itemId),
      eq(shoppingCartItem.cartId, cart.id),
    ),
  });

  if (!item) {
    return c.json({ success: false, error: "Item not found in cart" }, 404);
  }

  await db
    .update(shoppingCartItem)
    .set({ quantity })
    .where(eq(shoppingCartItem.id, itemId));

  return c.json({ success: true, message: "Cart item updated" });
});

/**
 * Clear all items from the user's cart
 */
app.delete("/clear", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;

  const cart = await db.query.shoppingCart.findFirst({
    where: eq(shoppingCart.userId, user.id),
  });

  if (!cart) {
    return c.json({ success: true, message: "Cart already empty" });
  }

  await db.delete(shoppingCartItem).where(eq(shoppingCartItem.cartId, cart.id));

  return c.json({ success: true, message: "Cart cleared" });
});

/**
 * POST /sync
 * Merge a local (client-side) cart with the server cart.
 * Used when a user logs in and we need to merge their localStorage cart
 * with any items already in their server cart.
 */
app.post("/sync", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const { items } = await c.req.json<{
    // Prices sent by the client are ignored: every line is repriced from
    // the catalogue so a tampered local cart can't set its own price.
    items: Array<{
      id: number;
      quantity: number;
      product_type: string;
      selected_options?: Array<{ id?: number; label?: string }>;
    }>;
  }>();

  if (!items || items.length === 0) {
    return c.json({ success: true, message: "Nothing to sync", items: [] });
  }

  // Find or create user's server cart
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

  let mergedCount = 0;

  for (const localItem of items) {
    const quantity = Math.max(
      1,
      Math.min(10, Math.trunc(Number(localItem.quantity)) || 1),
    );
    const priced = await priceConfiguration(
      localItem.id,
      localItem.selected_options ?? [],
    );
    if (!priced) continue; // product gone or no longer on sale

    if (localItem.product_type === "CUSTOM" && priced.matched > 0) {
      const [newConfig] = await db
        .insert(productConfiguration)
        .values({
          userId: user.id,
          productId: localItem.id,
          selectedOptions: priced.snapshot,
          finalPrice: priced.finalPrice,
          createdAt: new Date(),
        })
        .returning();
      if (!newConfig) continue;

      await db.insert(shoppingCartItem).values({
        cartId: cart!.id,
        productId: localItem.id,
        configurationId: newConfig.id,
        price: priced.finalPrice,
        quantity,
      });
      mergedCount++;
      continue;
    }

    // Standard products: one line per product
    const existingItem = await db.query.shoppingCartItem.findFirst({
      where: and(
        eq(shoppingCartItem.cartId, cart!.id),
        eq(shoppingCartItem.productId, localItem.id),
        isNull(shoppingCartItem.configurationId),
      ),
    });

    if (existingItem) {
      await db
        .update(shoppingCartItem)
        .set({
          quantity: existingItem.quantity + quantity,
          price: priced.finalPrice,
        })
        .where(eq(shoppingCartItem.id, existingItem.id));
    } else {
      await db.insert(shoppingCartItem).values({
        cartId: cart!.id,
        productId: localItem.id,
        price: priced.finalPrice,
        quantity,
      });
    }
    mergedCount++;
  }

  return c.json({
    success: true,
    message: `Synced ${mergedCount} items to server cart`,
    mergedCount,
  });
});

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
