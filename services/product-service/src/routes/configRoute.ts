import { Hono } from "hono";
import { getUser } from "../../../../packages/auth/src/middleware/authMiddleware";
import {
  customizationOption,
  db,
  product,
  productConfiguration,
} from "@repo/db";
import { desc, eq, inArray } from "drizzle-orm";

export const configHandler = new Hono().post("/save", getUser, async (c) => {
  const user = c.get("user");

  // 1. Get data from request
  // selections is expected to be an object: { fabric: 101, lapel: 102 }
  const { productId, selections } = await c.req.json<{
    productId: number;
    selections: Record<string, number>;
  }>();

  // 2. Verify Product exists and is customizable
  const productData = await db.query.product.findFirst({
    where: eq(product.id, productId),
  });

  if (!productData || productData.product_type !== "CUSTOM") {
    return c.json({ error: "Invalid or non-customizable product" }, 400);
  }

  // 3. Load and validate all selected options from DB
  const optionIds = Object.values(selections);
  const dbOptions = await db
    .select()
    .from(customizationOption)
    .where(inArray(customizationOption.id, optionIds));

  if (dbOptions.length !== optionIds.length) {
    return c.json({ error: "One or more selected options are invalid" }, 400);
  }

  // 4. Calculate secure price (Base + Deltas)
  const finalPrice = dbOptions.reduce(
    (sum, opt) => sum + Number(opt.price_delta),
    Number(productData.base_price),
  );

  // 5. Create a snapshot for the designJson (keeps data safe if IDs change later)
  const snapshot = dbOptions.reduce(
    (acc, opt) => {
      acc[opt.group_id] = {
        id: opt.id,
        label: opt.value,
        price_impact: opt.price_delta,
      };
      return acc;
    },
    {} as Record<string, any>,
  );

  // 6. Save to Neon
  const [newConfig] = await db
    .insert(productConfiguration)
    .values({
      kinde_user_id: user.id,
      product_id: productId,
      selected_options: snapshot, // Correct key from your schema
      final_price: finalPrice.toString(), // Convert to string if using decimal/numeric type
      createdAT: new Date(), // Correct key from your schema
    })
    .returning();

  // 7. Safety check for TypeScript
  if (!newConfig) {
    return c.json({ error: "Failed to save configuration" }, 500);
  }

  return c.json({
    success: true,
    configId: newConfig.id,
    finalPrice: finalPrice,
    message: "Suit design saved to your profile!",
  });
});

export const savedDesignsHandler = new Hono().get(
  "/my-designs",
  getUser,
  async (c) => {
    const user = c.get("user");

    // Fetch all configurations for this user
    // We join with the 'product' table to get the name and image of the suit
    const userDesigns = await db
      .select({
        id: productConfiguration.id,
        finalPrice: productConfiguration.final_price,
        selected_options: productConfiguration.selected_options,
        createdAt: productConfiguration.createdAT,
        name: product.name,
        // product_image: product.image,
      })
      .from(productConfiguration)
      .innerJoin(product, eq(productConfiguration.product_id, product.id))
      .where(eq(productConfiguration.kinde_user_id, user.id))
      .orderBy(desc(productConfiguration.createdAT));

    return c.json({
      success: true,
      designs: userDesigns,
    });
  },
);
