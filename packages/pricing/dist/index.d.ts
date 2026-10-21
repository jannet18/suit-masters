/**
 * Checkout pricing rules, shared by the storefront (to display a quote) and
 * order-service (which is authoritative and charges exactly what it computes).
 *
 * All money is integer minor units (pence), per ./money.ts. Catalogue prices
 * are VAT-inclusive, as UK law requires for consumer prices:
 * - UK deliveries pay the shown price; the receipt states the VAT it includes.
 * - Deliveries outside the UK are exports, zero-rated for UK VAT, so the VAT
 *   is taken off. The customer may owe import duty/VAT on delivery.
 */
export * from "./money.js";
export declare const CURRENCY = "GBP";
export declare const FREE_SHIPPING_THRESHOLD = 20000;
/** Countries we deliver to. Checkout offers exactly these. */
export declare const SHIPPING_COUNTRIES: readonly [{
    readonly code: "GB";
    readonly name: "United Kingdom";
    readonly zone: "UK";
}, {
    readonly code: "IE";
    readonly name: "Ireland";
    readonly zone: "EUROPE";
}, {
    readonly code: "FR";
    readonly name: "France";
    readonly zone: "EUROPE";
}, {
    readonly code: "DE";
    readonly name: "Germany";
    readonly zone: "EUROPE";
}, {
    readonly code: "IT";
    readonly name: "Italy";
    readonly zone: "EUROPE";
}, {
    readonly code: "ES";
    readonly name: "Spain";
    readonly zone: "EUROPE";
}, {
    readonly code: "NL";
    readonly name: "Netherlands";
    readonly zone: "EUROPE";
}, {
    readonly code: "BE";
    readonly name: "Belgium";
    readonly zone: "EUROPE";
}, {
    readonly code: "AT";
    readonly name: "Austria";
    readonly zone: "EUROPE";
}, {
    readonly code: "CH";
    readonly name: "Switzerland";
    readonly zone: "EUROPE";
}, {
    readonly code: "SE";
    readonly name: "Sweden";
    readonly zone: "EUROPE";
}, {
    readonly code: "DK";
    readonly name: "Denmark";
    readonly zone: "EUROPE";
}, {
    readonly code: "NO";
    readonly name: "Norway";
    readonly zone: "EUROPE";
}, {
    readonly code: "US";
    readonly name: "United States";
    readonly zone: "WORLD";
}, {
    readonly code: "CA";
    readonly name: "Canada";
    readonly zone: "WORLD";
}, {
    readonly code: "AU";
    readonly name: "Australia";
    readonly zone: "WORLD";
}, {
    readonly code: "JP";
    readonly name: "Japan";
    readonly zone: "WORLD";
}, {
    readonly code: "AE";
    readonly name: "United Arab Emirates";
    readonly zone: "WORLD";
}, {
    readonly code: "SG";
    readonly name: "Singapore";
    readonly zone: "WORLD";
}];
export type ShippingCountry = (typeof SHIPPING_COUNTRIES)[number];
/** Look up a supported country by ISO code or name; null if we don't ship there. */
export declare function findShippingCountry(codeOrName: string): ShippingCountry | null;
export type Promotion = {
    type: "percentage";
    percentOff: number;
    maxDiscount?: number | null;
} | {
    type: "fixed_amount";
    amountOff: number;
} | {
    type: "free_shipping";
};
export interface QuoteInput {
    /** Sum of VAT-inclusive line totals. */
    subtotal: number;
    /** Part of the subtotal the promotion applies to (defaults to all of it). */
    discountable?: number;
    countryCode: string;
    promotion?: Promotion | null;
}
/** Every amount is integer minor units; total = subtotal - discount - exportVatRelief + shipping. */
export interface Quote {
    currency: typeof CURRENCY;
    countryCode: string;
    isExport: boolean;
    subtotal: number;
    discount: number;
    shipping: number;
    /** UK VAT removed from an export order. */
    exportVatRelief: number;
    /** VAT contained in the total (UK orders); 0 for exports. */
    vatIncluded: number;
    total: number;
}
/** Discount for a promotion, capped so it can never exceed what it applies to. */
export declare function discountFor(promotion: Promotion | null | undefined, discountable: number): number;
export declare function quote(input: QuoteInput): Quote;
//# sourceMappingURL=index.d.ts.map