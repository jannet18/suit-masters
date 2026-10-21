import { type Tx, db } from "@repo/db";
import { type Quote } from "@repo/pricing";
import type { CheckoutItem } from "@repo/validation";
/**
 * Prices a checkout from the catalogue. The client only says what was chosen;
 * every price comes from the database, so the amount charged can't be
 * influenced by a tampered cart.
 */
export declare class CheckoutError extends Error {
    readonly code: "PRODUCT_UNAVAILABLE" | "UNSUPPORTED_COUNTRY";
    constructor(message: string, code: "PRODUCT_UNAVAILABLE" | "UNSUPPORTED_COUNTRY");
}
export interface PricedLine {
    productId: number;
    categoryId: number;
    name: string;
    quantity: number;
    /** pence */
    unitPrice: number;
    /** What the tailor makes: priced options plus free-text notes. */
    customization: {
        /** priceDelta in pence */
        options: Array<{
            group: string;
            name: string;
            value: string | null;
            priceDelta: number;
        }>;
        notes: string[];
        size?: string;
    };
    measurements?: Record<string, number | string>;
}
export interface PricedCheckout {
    lines: PricedLine[];
    quote: Quote;
    promotion: {
        id: number;
        code: string;
    } | null;
    /** Why the promo code wasn't applied, if one was given. */
    promoError: string | null;
}
export declare function priceCheckout(reader: Tx | typeof db, { items, country, promoCode, userId, }: {
    items: CheckoutItem[];
    country: string;
    promoCode?: string;
    userId: string;
}): Promise<PricedCheckout>;
//# sourceMappingURL=pricing.d.ts.map