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
export const DEFAULT_CURRENCY = "GBP";
export const DEFAULT_LOCALE = "en-GB";
/** Minor units per major unit. Correct for GBP/USD/EUR; JPY would be 1. */
const MINOR_PER_MAJOR = 100;
const MINOR_DIGITS = 2;
const formatters = new Map();
/**
 * 19900 -> "£199.00". The only way prices should be turned into text.
 */
export function formatCurrency(amountInMinorUnits, currencyCode = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
    assertMinorUnits(amountInMinorUnits);
    const key = `${locale}|${currencyCode}`;
    let formatter = formatters.get(key);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currencyCode,
        });
        formatters.set(key, formatter);
    }
    return formatter.format(amountInMinorUnits / MINOR_PER_MAJOR);
}
/**
 * "199.99" or 199.99 -> 19999. For user input and external data only.
 *
 * Strings are parsed digit by digit, so no floating-point error is possible.
 * Numbers go through their shortest decimal representation for the same
 * reason (1.005 * 100 is 100.49999… in floating point; this returns 101).
 * Anything past two decimal places is rounded half away from zero.
 */
export function toMinorUnits(majorAmount) {
    const text = typeof majorAmount === "number"
        ? numberToPlainString(majorAmount)
        : majorAmount.trim();
    const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(text.replace(/[,£$€\s]/g, ""));
    if (!match || (match[2] === "" && (match[3] ?? "") === "")) {
        throw new TypeError(`Not a money amount: ${JSON.stringify(majorAmount)}`);
    }
    const [, sign, whole = "", fraction = ""] = match;
    const kept = (fraction + "0".repeat(MINOR_DIGITS)).slice(0, MINOR_DIGITS);
    let minor = Number(whole || "0") * MINOR_PER_MAJOR + Number(kept);
    if (Number(fraction[MINOR_DIGITS] ?? "0") >= 5)
        minor += 1;
    const result = sign === "-" ? -minor : minor;
    if (!Number.isSafeInteger(result))
        throw new RangeError(`Amount out of range: ${majorAmount}`);
    return result === 0 ? 0 : result;
}
/**
 * 19999 -> 199.99. Only for integrations that insist on major units; never
 * use the result for arithmetic.
 */
export function toMajorUnits(minorAmount) {
    assertMinorUnits(minorAmount);
    return minorAmount / MINOR_PER_MAJOR;
}
/** 19999 -> "199.99" (no symbol), e.g. to pre-fill a price input. */
export function toMajorString(minorAmount) {
    assertMinorUnits(minorAmount);
    const sign = minorAmount < 0 ? "-" : "";
    const abs = Math.abs(minorAmount);
    const whole = Math.floor(abs / MINOR_PER_MAJOR);
    const fraction = String(abs % MINOR_PER_MAJOR).padStart(MINOR_DIGITS, "0");
    return `${sign}${whole}.${fraction}`;
}
/** Throws unless `value` is a safe integer — catches pounds leaking in. */
export function assertMinorUnits(value) {
    if (!Number.isSafeInteger(value)) {
        throw new TypeError(`Money must be an integer number of minor units, got ${value}`);
    }
}
/** Percentage of an amount, rounded half up to a whole minor unit. */
export function percentOf(amountInMinorUnits, percent) {
    assertMinorUnits(amountInMinorUnits);
    return Math.round((amountInMinorUnits * percent) / 100);
}
function numberToPlainString(n) {
    if (!Number.isFinite(n))
        throw new TypeError(`Not a money amount: ${n}`);
    // Shortest round-trip representation, expanded out of exponent notation
    const s = String(n);
    return /e/i.test(s) ? n.toFixed(20).replace(/0+$/, "").replace(/\.$/, "") : s;
}
