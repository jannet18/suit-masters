import { db } from "./db.js";
import type { Tx } from "./inventory.js";
import { promotionTable } from "./schema/promotions.js";
/**
 * Promo code rules shared by product-service (/promotions/validate) and
 * order-service (quote + order creation), so a code that validates is exactly
 * a code that gets charged.
 */
export type PromotionRow = typeof promotionTable.$inferSelect;
export type PromotionCheck = {
    ok: true;
    promotion: PromotionRow;
    /** Categories the discount is limited to; null = whole order. */
    categoryIds: number[] | null;
} | {
    ok: false;
    error: string;
};
type Reader = Tx | typeof db;
export declare function checkPromotion(reader: Reader, { code, subtotal, userId, }: {
    code: string;
    /** Order subtotal in pence. */
    subtotal: number;
    userId?: string | null;
}): Promise<PromotionCheck>;
/**
 * Record a redemption inside the order transaction. The conditional increment
 * means two shoppers can't both take the last use of a limited code.
 * Returns false if the code ran out in the meantime.
 */
export declare function redeemPromotion(tx: Tx, { promotionId, userId, orderId, }: {
    promotionId: number;
    userId: string;
    orderId: number;
}): Promise<boolean>;
export {};
//# sourceMappingURL=promotions.d.ts.map