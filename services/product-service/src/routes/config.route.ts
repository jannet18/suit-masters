// POST /config/save
// GET /config/my-designs

import { Hono, Context } from "hono";
import { getUser } from "@repo/auth";
import { desc, eq, inArray, and } from "@repo/db";
import {
  customizationOption,
  customizationGroup,
  db,
  product,
  productConfiguration,
  usersTable,
} from "@repo/db";

export const configHandler = new Hono().post(
  "/save",
  getUser,
  async (c: Context) => {
    try {
    const user = c.get("user");

    // 1. Get data from request
    // selections is expected to be an object: { fabric: 101, lapel: 102 }
    const { productId, selections } = await c.req.json<{
      productId: number;
      selections: Record<number, number>; // group_id -> option_id
    }>();

    if (!productId || !selections || Object.keys(selections).length === 0) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    // 2. Verify Product exists and is customizable
    const productData = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });

    if (!productData) {
      return c.json({ error: "Invalid product" }, 400);
    }
 const optionIds = Object.values(selections);
    // 3. Secure Validation: Fetch options from DB and ensure they belong to the correct groups for this product. This prevents tampering with IDs in the request.
  const validOptions = await db.select({
    id: customizationOption.id,
    groupId: customizationOption.groupId,
    value: customizationOption.value,
    priceDelta: customizationOption.priceDelta,
  }).from(customizationOption)
  .innerJoin(customizationGroup, eq(customizationOption.groupId, customizationGroup.id)).where(and(inArray(customizationOption.id, optionIds), eq(customizationGroup.categoryId, productData.categoryId)));

  // If the lengths mismatch, the user passed an invalid option ID or 
      // an option belonging to a different product category. Reject immediately!
      if(validOptions.length !== optionIds.length) {
        return c.json({ error: "One or more selected options are invalid" }, 400);
      }
      // 4. Calculate the final price based on the base price and the selected options' price deltas
      const finalPrice = validOptions.reduce((sum, opt) => sum + Number(opt.priceDelta), Number(productData.basePrice));

    // const dbOptions = await db
    //   .select()
    //   .from(customizationOption)
    //   .where(inArray(customizationOption.id, optionIds));

    // if (dbOptions.length !== optionIds.length) {
    //   return c.json({ error: "One or more selected options are invalid" }, 400);
    // }

    // // 4. Calculate secure price (Base + Deltas)
    // const finalPrice = dbOptions.reduce(
    //   (sum: any, opt: any) => sum + Number(opt.price_delta),
    //   Number(productData.basePrice),
    // );

    // 5. Create a structural design snapshot for the historical reference of the user's selections. This is a simplified representation of the design.
    const snapshot = validOptions.reduce(
      (acc: any, opt: any) => {
        acc[opt.groupId] = {
          id: opt.id,
          label: opt.value,
          price_impact: Number(opt.priceDelta),
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    // 6. Save to Neon with user association
    const [newConfig] = await db
      .insert(productConfiguration)
      .values({
        productId: productId,
        kindeUserId: user.id,
        selectedOptions: snapshot,
        finalPrice: finalPrice.toString(),
        createdAt: new Date(),
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
  } catch (error) {
    console.error("Error saving configuration:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
  }
);

export const savedDesignsHandler = new Hono().get(
  "/my-designs",
  getUser,
  async (c: Context) => {
    const user = c.get("user");

    // Fetch all configurations for this user
    // We join with the 'product' table to get the name and image of the suit
    const userDesigns = await db
      .select({
        id: productConfiguration.id,
        finalPrice: productConfiguration.finalPrice,
        selected_options: productConfiguration.selectedOptions,
        createdAt: productConfiguration.createdAt,
        name: product.name,
        // product_image: product.image,
      })
      .from(productConfiguration)
      .innerJoin(product, eq(productConfiguration.productId, product.id))
      .orderBy(desc(productConfiguration.createdAt));

    return c.json({
      success: true,
      designs: userDesigns,
    });
  },
);

// ─── Profile Routes ──────────────────────────────────────────────────────────

/**
 * GET /config/profile
 * Fetch the authenticated user's profile from the database.
 */
export const profileGetHandler = new Hono().get(
  "/profile",
  getUser,
  async (c: Context) => {
    const user = c.get("user");

    const profile = await db.query.usersTable.findFirst({
      where: eq(usersTable.kinde_user_id, user.id),
    });

    if (!profile) {
      return c.json({ success: false, error: "Profile not found" }, 404);
    }

    return c.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        roles: profile.roles,
      },
    });
  },
);

/**
 * PUT /config/profile
 * Update the authenticated user's profile (name, phone, address).
 * Stores phone and address in the `picture` field as JSON or extends schema.
 * For now, we update name and store phone/address in a metadata JSON approach.
 */
export const profilePutHandler = new Hono().put(
  "/profile",
  getUser,
  async (c: Context) => {
    try {
    const user = c.get("user");

    const body = await c.req.json<{
      name?: string;
      phone?: string;
      address?: string;
      pictureUrl?: string; // Optional: if you want to allow updating the picture URL
    }>();

    // Build update object — only update provided fields
    const updates: Record<string, any> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.address !== undefined) updates.address = body.address;
    if (body.pictureUrl !== undefined) updates.picture = body.pictureUrl;

    if (Object.keys(updates).length === 0) {
      return c.json({ success: true, message: "Nothing to update" });
    }

    // execute update directly matching user boundaries
    const [updatedProfile] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.kinde_user_id, user.id))
      .returning();

    if (!updatedProfile) {
      return c.json({ success: false, error: "Failed to update profile" }, 500);
    }

    // // For phone and address, we store them in the `picture` field as JSON metadata
    // // since the usersTable schema doesn't have dedicated phone/address columns.
    // // This is a pragmatic approach without requiring a schema migration.
    // if (body.phone !== undefined || body.address !== undefined) {
    //   // Fetch existing profile to merge metadata
    //   const existing = await db.query.usersTable.findFirst({
    //     where: eq(usersTable.kinde_user_id, user.id),
    //   });

    //   if (existing) {
    //     // Try to parse existing picture as metadata, or start fresh
    //     let metadata: Record<string, string> = {};
    //     try {
    //       if (existing.picture && existing.picture.startsWith("{")) {
    //         metadata = JSON.parse(existing.picture);
    //       }
    //     } catch {
    //       // Not JSON, start fresh
    //     }

    //     if (body.phone !== undefined) metadata.phone = body.phone;
    //     if (body.address !== undefined) metadata.address = body.address;

    //     // Store metadata as JSON in picture field (we keep the original picture URL
    //     // in a 'pictureUrl' key so it's not lost)
    //     if (!metadata.pictureUrl && existing.picture && !existing.picture.startsWith("{")) {
    //       metadata.pictureUrl = existing.picture;
    //     }

    //     updates.picture = JSON.stringify(metadata);
    //   }
    // }

    // if (Object.keys(updates).length === 0) {
    //   return c.json({ success: true, message: "Nothing to update" });
    // }

    // await db
    //   .update(usersTable)
    //   .set(updates)
    //   .where(eq(usersTable.kinde_user_id, user.id));

    return c.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
  }
);
