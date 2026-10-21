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
import { assertMinorUnits, percentOf } from "./money.js";
export * from "./money.js";
export const CURRENCY = "GBP";
/** UK standard VAT, as a fraction: 20% = 1/5. Kept rational so VAT maths stays exact. */
const UK_VAT = { numerator: 1, denominator: 5 };
export const FREE_SHIPPING_THRESHOLD = 200_00;
const SHIPPING_COST = {
    UK: 5_00,
    EUROPE: 12_00,
    WORLD: 20_00,
};
/** Countries we deliver to. Checkout offers exactly these. */
export const SHIPPING_COUNTRIES = [
    { code: "GB", name: "United Kingdom", zone: "UK" },
    { code: "IE", name: "Ireland", zone: "EUROPE" },
    { code: "FR", name: "France", zone: "EUROPE" },
    { code: "DE", name: "Germany", zone: "EUROPE" },
    { code: "IT", name: "Italy", zone: "EUROPE" },
    { code: "ES", name: "Spain", zone: "EUROPE" },
    { code: "NL", name: "Netherlands", zone: "EUROPE" },
    { code: "BE", name: "Belgium", zone: "EUROPE" },
    { code: "AT", name: "Austria", zone: "EUROPE" },
    { code: "CH", name: "Switzerland", zone: "EUROPE" },
    { code: "SE", name: "Sweden", zone: "EUROPE" },
    { code: "DK", name: "Denmark", zone: "EUROPE" },
    { code: "NO", name: "Norway", zone: "EUROPE" },
    { code: "US", name: "United States", zone: "WORLD" },
    { code: "CA", name: "Canada", zone: "WORLD" },
    { code: "AU", name: "Australia", zone: "WORLD" },
    { code: "JP", name: "Japan", zone: "WORLD" },
    { code: "AE", name: "United Arab Emirates", zone: "WORLD" },
    { code: "SG", name: "Singapore", zone: "WORLD" },
];
/** Look up a supported country by ISO code or name; null if we don't ship there. */
export function findShippingCountry(codeOrName) {
    const needle = codeOrName.trim().toLowerCase();
    return (SHIPPING_COUNTRIES.find((c) => c.code.toLowerCase() === needle || c.name.toLowerCase() === needle) ?? null);
}
/** Discount for a promotion, capped so it can never exceed what it applies to. */
export function discountFor(promotion, discountable) {
    if (!promotion || discountable <= 0)
        return 0;
    let discount = 0;
    if (promotion.type === "percentage") {
        discount = percentOf(discountable, promotion.percentOff);
        if (promotion.maxDiscount != null)
            discount = Math.min(discount, promotion.maxDiscount);
    }
    else if (promotion.type === "fixed_amount") {
        discount = promotion.amountOff;
    }
    return Math.max(0, Math.min(discount, discountable));
}
/** VAT contained in a VAT-inclusive amount: amount * rate / (1 + rate), rounded half up. */
function vatWithin(amount) {
    const { numerator, denominator } = UK_VAT;
    return Math.round((amount * numerator) / (denominator + numerator));
}
export function quote(input) {
    const country = findShippingCountry(input.countryCode);
    if (!country)
        throw new Error(`We don't ship to ${input.countryCode}`);
    const subtotal = input.subtotal;
    assertMinorUnits(subtotal);
    const discountable = Math.min(input.discountable ?? subtotal, subtotal);
    const discount = discountFor(input.promotion, discountable);
    const goods = subtotal - discount;
    const freeShipping = input.promotion?.type === "free_shipping" ||
        goods >= FREE_SHIPPING_THRESHOLD;
    const shipping = goods === 0 || freeShipping ? 0 : SHIPPING_COST[country.zone];
    const isExport = country.code !== "GB";
    const exportVatRelief = isExport ? vatWithin(goods) : 0;
    const total = goods - exportVatRelief + shipping;
    const vatIncluded = isExport ? 0 : vatWithin(total);
    return {
        currency: CURRENCY,
        countryCode: country.code,
        isExport,
        subtotal,
        discount,
        shipping,
        exportVatRelief,
        vatIncluded,
        total,
    };
}
