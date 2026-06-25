import { Hono } from "hono";
import { db, promotionTable, promotionCategory, promotionUsage, sql } from "@repo/db";
import { eq, and, gte, lte } from "@repo/db";

export const promotionsHandler = new Hono();

/**
 * GET /promotions
 * Public: list all active promotions.
 */
promotionsHandler.get("/", async (c) => {
  try {
    const now = new Date();
    const activePromotions = await db.query.promotionTable.findMany({
      where: (table, { and: andFn, eq: eqFn, gte: gteFn, lte: lteFn }) =>
        andFn(
          eqFn(table.isActive, true),
          gteFn(table.startDate, now),
          lteFn(table.endDate, now),
        ),
      orderBy: (table, { desc }) => [desc(table.id)],
    });

    return c.json({ success: true, promotions: activePromotions });
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return c.json(
      { success: false, promotions: [], error: "Failed to fetch promotions" },
      500,
    );
  }
});

/**
 * POST /promotions/validate
 * Public: validate a promo code and return discount info.
 */
promotionsHandler.post("/validate", async (c) => {
  try {
    const { code, subtotal, userId } = await c.req.json<{ code: string; subtotal: number; userId: string }>();

    if (!code) {
      return c.json({ valid: false, error: "Coupon code is required" }, 400);
    }
// 1. Fetch active promotion matching exact trimmed uppercase code
    const promotion = await db.query.promotionTable.findFirst({
      where: (table, { eq: eqFn, and: andFn }) => andFn(eqFn(table.code, code.toUpperCase()), eqFn(table.isActive, true)),
    });

    if (!promotion) {
      return c.json({ valid: false, error: "Invalid promo code" }, 404);
    }
// 2. Validate tempral constraints (is it active and within start/end dates)
    const now = new Date();

    if (promotion.startDate && new Date(promotion.startDate) > now) {
      return c.json({ valid: false, error: "This Coupon code is not yet valid" }, 400);
    }
    if (promotion.endDate && new Date(promotion.endDate) < now) {
      return c.json({ valid: false, error: "This Coupon code has expired" }, 400);
    }
    // 3. Validate usage limits (global and per-user)
    if (promotion.minOrderAmount && subtotal < Number(promotion.minOrderAmount)) {
      return c.json({ valid: false, error: `This promo code requires a minimum order amount of ${promotion.minOrderAmount}` }, 400);
    }
    // 4 Validate max redemptions across total Platform (Global caps)
    if (promotion.usageLimit != null) {
      const totalUsage = await db.select({
        count: sql<number>`count(*)`,
      }).from(promotionUsage).where(eq(promotionUsage.promotionId, promotion.id));

      const totalRedemptions = totalUsage[0]?.count || 0;
      if (totalRedemptions >= Number(promotion.usageLimit)) {
        return c.json({ valid: false, error: "This promo code has reached its maximum redemptions" }, 400);
      }
    }
    // 5. Validate per-user usage limit (if userId is provided)
    if (userId && promotion.perUserLimit != null) {
      const userUsageCount = await db.select({
        count: sql<number>`count(*)`,
      }).from(promotionUsage).where(and(eq(promotionUsage.promotionId, promotion.id), eq(promotionUsage.userId, userId)));
      
      const timeUsed = userUsageCount[0]?.count || 0;
      if (timeUsed >= Number(promotion.perUserLimit)) {
        return c.json({ valid: false, error: "You have already used this promo code the maximum number of times allowed" }, 400);
      }
    }
   
// 6. Calculate Savings impact
    let discountAmount = 0;
    if (promotion.type === "percentage") {
      discountAmount = (Number(promotion.discountRate) / 100) * subtotal;
    } else if (promotion.type === "fixed_amount") {
      discountAmount = Number(promotion.discountRate);
    } else if (promotion.type === "free_shipping") {
      discountAmount = 0;
    }
    // Cap discount amount at the subtotal so it never results in negative balances
    const finalDiscount = Math.min(discountAmount, subtotal);
  
    return c.json({
      success: true,
      promotionId: promotion.id,
      code: promotion.code,
      discountType: promotion.type,
      discountRate: promotion.discountRate,
      appliedDiscount: Number(finalDiscount.toFixed(2)),
      newSubtotal: Number((subtotal - finalDiscount).toFixed(2)),
     
    });
  } catch (error) {
    console.error("Failed to validate coupon code:", error);
    return c.json({ error: "Failed to validate coupon code" }, 500);
  }
});

/**
 * GET /promotions/all
 * Admin: list all promotions.
 */
promotionsHandler.get("/all", async (c) => {
  try {
    const promotions = await db.query.promotionTable.findMany({
      orderBy: (table, { desc }) => [desc(table.id)],
    });

    return c.json({ success: true, promotions });
  } catch (error) {
    console.error("Failed to fetch all promotions:", error);
    return c.json(
      { success: false, promotions: [], error: "Failed to fetch promotions" },
      500,
    );
  }
});

/**
 * POST /promotions
 * Admin: create a new promotion.
 */
promotionsHandler.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      name: string;
      code: string;
      description?: string;
      type?: string;
      discountRate: string;
      minOrderAmount?: string;
      maxDiscountAmount?: string;
      usageLimit?: number;
      perUserLimit?: number;
      startDate: string;
      endDate: string;
      isActive?: boolean;
      categoryIds?: number[];
    }>();

    if (!body.name || !body.code || !body.discountRate || !body.startDate || !body.endDate) {
      return c.json({ error: "Name, code, discount rate, start date, and end date are required" }, 400);
    }

    const [newPromotion] = await db
      .insert(promotionTable)
      .values({
        name: body.name,
        code: body.code.toUpperCase(),
        description: body.description || null,
        type: (body.type as any) || "percentage",
        discountRate: body.discountRate,
        minOrderAmount: body.minOrderAmount || null,
        maxDiscountAmount: body.maxDiscountAmount || null,
        usageLimit: body.usageLimit ?? null,
        perUserLimit: body.perUserLimit ?? 1,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: body.isActive ?? true,
      })
      .returning();

    if (!newPromotion) {
      return c.json({ error: "Failed to create promotion" }, 500);
    }

    // Add category associations if provided
    if (body.categoryIds && body.categoryIds.length > 0) {
      await db.insert(promotionCategory).values(
        body.categoryIds.map((categoryId) => ({
          promotionId: newPromotion.id,
          categoryId,
        })),
      );
    }

    return c.json({ success: true, promotion: newPromotion }, 201);
  } catch (error) {
    console.error("Failed to create promotion:", error);
    return c.json({ error: "Failed to create promotion" }, 500);
  }
});

/**
 * PUT /promotions/:id
 * Admin: update a promotion.
 */
promotionsHandler.put("/:id", async (c) => {
  try {
    const promotionId = Number(c.req.param("id"));
    const body = await c.req.json<{
      name?: string;
      code?: string;
      description?: string;
      type?: string;
      discountRate?: string;
      minOrderAmount?: string;
      maxDiscountAmount?: string;
      usageLimit?: number;
      perUserLimit?: number;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
    }>();

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.code !== undefined) updates.code = body.code.toUpperCase();
    if (body.description !== undefined) updates.description = body.description;
    if (body.type !== undefined) updates.type = body.type;
    if (body.discountRate !== undefined) updates.discountRate = body.discountRate;
    if (body.minOrderAmount !== undefined) updates.minOrderAmount = body.minOrderAmount;
    if (body.maxDiscountAmount !== undefined) updates.maxDiscountAmount = body.maxDiscountAmount;
    if (body.usageLimit !== undefined) updates.usageLimit = body.usageLimit;
    if (body.perUserLimit !== undefined) updates.perUserLimit = body.perUserLimit;
    if (body.startDate !== undefined) updates.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updates.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    if (Object.keys(updates).length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }

    await db
      .update(promotionTable)
      .set(updates)
      .where(eq(promotionTable.id, promotionId));

    return c.json({ success: true, message: "Promotion updated" });
  } catch (error) {
    console.error("Failed to update promotion:", error);
    return c.json({ error: "Failed to update promotion" }, 500);
  }
});

/**
 * DELETE /promotions/:id
 * Admin: delete a promotion.
 */
promotionsHandler.delete("/:id", async (c) => {
  try {
    const promotionId = Number(c.req.param("id"));

    // Delete category associations first
    await db
      .delete(promotionCategory)
      .where(eq(promotionCategory.promotionId, promotionId));

    await db
      .delete(promotionTable)
      .where(eq(promotionTable.id, promotionId));

    return c.json({ success: true, message: "Promotion deleted" });
  } catch (error) {
    console.error("Failed to delete promotion:", error);
    return c.json({ error: "Failed to delete promotion" }, 500);
  }
});