import { and, eq, sql } from "drizzle-orm";
import { formatCurrency } from "@repo/pricing";
import { promotionCategory, promotionTable, promotionUsage, } from "./schema/promotions.js";
export async function checkPromotion(reader, { code, subtotal, userId, }) {
    const normalized = code.trim().toUpperCase();
    if (!normalized)
        return { ok: false, error: "Coupon code is required" };
    const [promotion] = await reader
        .select()
        .from(promotionTable)
        .where(and(eq(promotionTable.code, normalized), eq(promotionTable.isActive, true)));
    if (!promotion)
        return { ok: false, error: "Invalid promo code" };
    const now = new Date();
    if (promotion.startDate > now)
        return { ok: false, error: "This promo code is not valid yet" };
    if (promotion.endDate < now)
        return { ok: false, error: "This promo code has expired" };
    if (promotion.minOrderAmount != null && subtotal < promotion.minOrderAmount) {
        return {
            ok: false,
            error: `This promo code needs a minimum order of ${formatCurrency(promotion.minOrderAmount)}`,
        };
    }
    if (promotion.usageLimit != null &&
        promotion.usageCount >= promotion.usageLimit) {
        return {
            ok: false,
            error: "This promo code has reached its maximum redemptions",
        };
    }
    if (userId && promotion.perUserLimit != null) {
        const [used] = await reader
            .select({ count: sql `count(*)::int` })
            .from(promotionUsage)
            .where(and(eq(promotionUsage.promotionId, promotion.id), eq(promotionUsage.userId, userId)));
        if ((used?.count ?? 0) >= promotion.perUserLimit) {
            return { ok: false, error: "You have already used this promo code" };
        }
    }
    const categories = await reader
        .select({ categoryId: promotionCategory.categoryId })
        .from(promotionCategory)
        .where(eq(promotionCategory.promotionId, promotion.id));
    return {
        ok: true,
        promotion,
        categoryIds: categories.length ? categories.map((c) => c.categoryId) : null,
    };
}
/**
 * Record a redemption inside the order transaction. The conditional increment
 * means two shoppers can't both take the last use of a limited code.
 * Returns false if the code ran out in the meantime.
 */
export async function redeemPromotion(tx, { promotionId, userId, orderId, }) {
    const [claimed] = await tx
        .update(promotionTable)
        .set({ usageCount: sql `${promotionTable.usageCount} + 1` })
        .where(and(eq(promotionTable.id, promotionId), sql `(${promotionTable.usageLimit} IS NULL OR ${promotionTable.usageCount} < ${promotionTable.usageLimit})`))
        .returning({ id: promotionTable.id });
    if (!claimed)
        return false;
    await tx.insert(promotionUsage).values({ promotionId, userId, orderId });
    return true;
}
