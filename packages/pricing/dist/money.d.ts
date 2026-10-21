/**
 * Money convention for the whole monorepo:
 *
 *   Every monetary amount — in the database, in API payloads, in stores and
 *   in component props — is an integer number of minor units (pence for GBP).
 *   £199.00 is 19900.
 *
 * Arithmetic is integer addition/multiplication only. Converting to or from
 * major units (pounds) happens at the edges, through these helpers: when a
 * person types a price, and when a price is displayed.
 */
export declare const DEFAULT_CURRENCY = "GBP";
export declare const DEFAULT_LOCALE = "en-GB";
/**
 * 19900 -> "£199.00". The only way prices should be turned into text.
 */
export declare function formatCurrency(amountInMinorUnits: number, currencyCode?: string, locale?: string): string;
/**
 * "199.99" or 199.99 -> 19999. For user input and external data only.
 *
 * Strings are parsed digit by digit, so no floating-point error is possible.
 * Numbers go through their shortest decimal representation for the same
 * reason (1.005 * 100 is 100.49999… in floating point; this returns 101).
 * Anything past two decimal places is rounded half away from zero.
 */
export declare function toMinorUnits(majorAmount: number | string): number;
/**
 * 19999 -> 199.99. Only for integrations that insist on major units; never
 * use the result for arithmetic.
 */
export declare function toMajorUnits(minorAmount: number): number;
/** 19999 -> "199.99" (no symbol), e.g. to pre-fill a price input. */
export declare function toMajorString(minorAmount: number): string;
/** Throws unless `value` is a safe integer — catches pounds leaking in. */
export declare function assertMinorUnits(value: number): asserts value is number;
/** Percentage of an amount, rounded half up to a whole minor unit. */
export declare function percentOf(amountInMinorUnits: number, percent: number): number;
//# sourceMappingURL=money.d.ts.map