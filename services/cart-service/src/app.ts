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
import { errorHandler, notFoundHandler } from "@repo/error-handling";

// Define a typed user object to satisfy TypeScript
type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

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

interface CustomizationOptionRow {
  id: number;
  groupId: string;
  value: string;
  priceDelta: string;
}

interface SelectedOptionSnapshot {
  id: number;
  label: string;
  price_impact: string | number;
}

interface CartItemRow {
  itemId: number;
  qty: number;
  productName: string | null;
  productImage: string | null;
  skuPrice: string | null;
  configuration?: Record<string, any> | null;
  configurationPrice?: string | null;
  selectedOptions?: Record<string, any> | null;
  configurationId?: number | null;
  measurementId?: string | null;
}

const app = new Hono();

// Health check
app.get("/health", (c) => c.json({ status: "ok", service: "cart-service" }));

app.post("/design/save", getUser, async (c: Context) => {
  const user = c.get("user") as AuthUser;
  const { productId, selections, measurements, qty } = await c.req.json<DesignSaveRequest>();

  // 1️⃣ Validate product
  const productData = await db.query.product.findFirst({
    where: eq(product.id, productId),
  });
  if (!productData || productData.productType !== "CUSTOM") {
    return c.json({ error: "Invalid or non-customizable product" }, 400);
  }

  // 2️⃣ Validate selected options
  const optionIds = Object.values(selections) as number[];
  const dbOptions = (await db
    .select()
    .from(customizationOption)
    .where(inArray(customizationOption.id, optionIds))) as unknown as CustomizationOptionRow[];

  if (dbOptions.length !== optionIds.length) {
    return c.json({ error: "One or more selected options are invalid" }, 400);
  }

  // 3️⃣ Calculate final price
  const finalPrice =
    Number(productData.basePrice) +
    dbOptions.reduce<number>((sum, opt) => sum + Number(opt.priceDelta), 0);

  const snapshot = dbOptions.reduce<Record<string, SelectedOptionSnapshot>>((acc, opt) => {
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
  const {productId, qty} = await c.req.json<{ productId: number; qty: number }>();
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
if(existingItem) {
    await db
      .update(shoppingCartItem)
      .set({ quantity: existingItem.quantity + safetyQty })
      .where(eq(shoppingCartItem.id, existingItem.id));
  } else {
    await db.insert(shoppingCartItem).values({
      cartId: cart!.id,
      productId,
      configurationId: null, // No configuration for standard products
      price: ProductData.basePrice.toString(),
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
      skuPrice: productItem.price,
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
    return c.json({ success: false, error: "Quantity must be at least 1" }, 400);
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
    items: Array<{
      id: number;
      name: string;
      base_price: number;
      image_url: string;
      product_type: string;
      quantity: number;
      selected_options?: Array<{ id: number; group_id: number; label: string; price_impact: string }>;
      configuration?: Record<string, any>;
      totalPrice: number;
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

  // For each local item, check if it already exists in the server cart
  for (const localItem of items) {
    // For CUSTOM products with selected_options, we need to save the configuration first
    if (localItem.product_type === "CUSTOM" && localItem.selected_options?.length) {
      // Save configuration
      const snapshot = localItem.selected_options.reduce(
        (acc: Record<string, any>, opt: any) => {
          acc[opt.group_id] = {
            id: opt.id,
            label: opt.label,
            price_impact: opt.price_impact,
          };
          return acc;
        },
        {} as Record<string, any>,
      );

      const [newConfig] = await db
        .insert(productConfiguration)
        .values({
          kindeUserId: user.id,
          productId: localItem.id,
          selectedOptions: snapshot,
          finalPrice: localItem.totalPrice.toString(),
          createdAt: new Date(),
        })
        .returning();

      if (newConfig) {
        // Check if item already exists
        const existingItem = await db.query.shoppingCartItem.findFirst({
          where: and(
            eq(shoppingCartItem.cartId, cart!.id),
            eq(shoppingCartItem.productId, localItem.id),
            eq(shoppingCartItem.configurationId, newConfig.id),
          ),
        });

        if (existingItem) {
          await db
            .update(shoppingCartItem)
            .set({ quantity: existingItem.quantity + localItem.quantity })
            .where(eq(shoppingCartItem.id, existingItem.id));
        } else {
          await db.insert(shoppingCartItem).values({
            cartId: cart!.id,
            productId: localItem.id,
            configurationId: newConfig.id,
            price: localItem.totalPrice.toString(),
            quantity: localItem.quantity,
          });
        }
        mergedCount++;
      }
    } else {
      // For STANDARD products, add directly
      const existingItem = await db.query.shoppingCartItem.findFirst({
        where: and(
          eq(shoppingCartItem.cartId, cart!.id),
          eq(shoppingCartItem.productId, localItem.id),
        ),
      });

      if (existingItem) {
        await db
          .update(shoppingCartItem)
          .set({ quantity: existingItem.quantity + localItem.quantity })
          .where(eq(shoppingCartItem.id, existingItem.id));
      } else {
        await db.insert(shoppingCartItem).values({
          cartId: cart!.id,
          productId: localItem.id,
          price: localItem.base_price.toString(),
          quantity: localItem.quantity,
        });
      }
      mergedCount++;
    }
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
