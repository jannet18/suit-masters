import { Hono } from "hono";
import {
  db,
  promotionTable,
  promotionCategory,
  checkPromotion,
} from "@repo/db";
import { eq, and, gte, lte } from "@repo/db";
import { getUser, requireRole, type AuthEnv } from "@repo/auth";
import {
  createPromotionSchema,
  validateRequest,
  type PromotionData,
} from "@repo/validation";

export const promotionsHandler = new Hono<AuthEnv>();
const requireAdmin = [getUser, requireRole("ADMIN")] as const;

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
          lteFn(table.startDate, now),
          gteFn(table.endDate, now),
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
    // subtotal is integer pence
    const { code, subtotal, userId } = await c.req.json<{
      code: string;
      subtotal: number;
      userId?: string;
    }>();
    if (!Number.isSafeInteger(subtotal) || subtotal < 0) {
      return c.json(
        { valid: false, error: "subtotal must be whole pence" },
        400,
      );
    }

    // Same rules order-service applies when it charges the order
    const check = await checkPromotion(db, {
      code: code ?? "",
      subtotal,
      userId,
    });
    if (!check.ok) return c.json({ valid: false, error: check.error }, 400);

    const { promotion } = check;
    return c.json({
      valid: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        percentOff: promotion.percentOff,
        amountOff: promotion.amountOff,
        categoryIds: check.categoryIds,
      },
    });
  } catch (error) {
    console.error("Failed to validate coupon code:", error);
    return c.json(
      { valid: false, error: "Failed to validate coupon code" },
      500,
    );
  }
});

/**
 * GET /promotions/all
 * Admin: list all promotions.
 */
promotionsHandler.get("/all", ...requireAdmin, async (c) => {
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

/** Columns for a validated promotion; the unused discount field is cleared. */
function promotionColumns(p: PromotionData) {
  return {
    name: p.name,
    code: p.code,
    description: p.description || null,
    type: p.type,
    percentOff: p.type === "percentage" ? p.percentOff : null,
    amountOff: p.type === "fixed_amount" ? p.amountOff : null,
    minOrderAmount: p.minOrderAmount ?? null,
    maxDiscountAmount: p.maxDiscountAmount ?? null,
    usageLimit: p.usageLimit ?? null,
    perUserLimit: p.perUserLimit ?? 1,
    startDate: p.startDate,
    endDate: p.endDate,
    isActive: p.isActive ?? true,
  };
}

/**
 * POST /promotions
 * Admin: create a promotion. Amounts (amountOff, minOrderAmount,
 * maxDiscountAmount) are integer pence; percentOff is a percentage.
 */
promotionsHandler.post("/", ...requireAdmin, async (c) => {
  const parsed = validateRequest(
    createPromotionSchema,
    await c.req.json().catch(() => undefined),
  );
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);

  try {
    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(promotionTable)
        .values(promotionColumns(parsed.data))
        .returning();
      if (!row) throw new Error("Promotion insert returned no row");
      if (parsed.data.categoryIds?.length) {
        await tx
          .insert(promotionCategory)
          .values(
            parsed.data.categoryIds.map((categoryId) => ({
              promotionId: row.id,
              categoryId,
            })),
          );
      }
      return row;
    });
    return c.json({ success: true, promotion: created }, 201);
  } catch (error) {
    if ((error as { cause?: { code?: string } })?.cause?.code === "23505") {
      return c.json(
        { success: false, error: "A promotion with this code already exists" },
        409,
      );
    }
    console.error("Failed to create promotion:", error);
    return c.json({ success: false, error: "Failed to create promotion" }, 500);
  }
});

/**
 * PUT /promotions/:id
 * Admin: replace a promotion (same body as POST). Full replacement keeps the
 * discount type and its amount consistent.
 */
promotionsHandler.put("/:id", ...requireAdmin, async (c) => {
  const promotionId = Number(c.req.param("id"));
  const parsed = validateRequest(
    createPromotionSchema,
    await c.req.json().catch(() => undefined),
  );
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);

  try {
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(promotionTable)
        .set({ ...promotionColumns(parsed.data), updatedAt: new Date() })
        .where(eq(promotionTable.id, promotionId))
        .returning();
      if (!row) return null;
      await tx
        .delete(promotionCategory)
        .where(eq(promotionCategory.promotionId, promotionId));
      if (parsed.data.categoryIds?.length) {
        await tx
          .insert(promotionCategory)
          .values(
            parsed.data.categoryIds.map((categoryId) => ({
              promotionId,
              categoryId,
            })),
          );
      }
      return row;
    });
    if (!updated)
      return c.json({ success: false, error: "Promotion not found" }, 404);
    return c.json({ success: true, promotion: updated });
  } catch (error) {
    if ((error as { cause?: { code?: string } })?.cause?.code === "23505") {
      return c.json(
        { success: false, error: "A promotion with this code already exists" },
        409,
      );
    }
    console.error("Failed to update promotion:", error);
    return c.json({ success: false, error: "Failed to update promotion" }, 500);
  }
});

/**
 * DELETE /promotions/:id
 * Admin: delete a promotion.
 */
promotionsHandler.delete("/:id", ...requireAdmin, async (c) => {
  try {
    const promotionId = Number(c.req.param("id"));

    // Delete category associations first
    await db
      .delete(promotionCategory)
      .where(eq(promotionCategory.promotionId, promotionId));

    await db.delete(promotionTable).where(eq(promotionTable.id, promotionId));

    return c.json({ success: true, message: "Promotion deleted" });
  } catch (error) {
    console.error("Failed to delete promotion:", error);
    return c.json({ error: "Failed to delete promotion" }, 500);
  }
});
