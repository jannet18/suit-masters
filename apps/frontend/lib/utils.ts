import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tax rates by country (as decimal percentages).
 * Defaults to 0% if country is not recognised.
 */
const TAX_RATES: Record<string, number> = {
  GB: 0.20, // United Kingdom — 20% VAT
  DE: 0.19, // Germany — 19% VAT
  FR: 0.20, // France — 20% VAT
  IT: 0.22, // Italy — 22% VAT
  ES: 0.21, // Spain — 21% VAT
  US: 0.00, // United States — no VAT (sales tax varies by state)
  CA: 0.05, // Canada — 5% GST (provincial taxes extra)
  AU: 0.10, // Australia — 10% GST
  JP: 0.10, // Japan — 10% consumption tax
  AE: 0.05, // UAE — 5% VAT
  SG: 0.09, // Singapore — 9% GST
};

/**
 * Returns the applicable tax rate for a given country code.
 * @param country — ISO 3166-1 alpha-2 country code (e.g. "GB", "US")
 */
export function getTaxRate(country: string): number {
  return TAX_RATES[country.toUpperCase()] ?? 0;
}

/**
 * Shipping costs by region.
 * - UK: £5.00
 * - Europe: £12.00
 * - Rest of World: £20.00
 * - Free shipping for orders over £200 (subtotal before tax)
 */
const SHIPPING_ZONES: Record<string, { label: string; cost: number }> = {
  GB: { label: "United Kingdom", cost: 500 },    // £5.00 in pence
  IE: { label: "Ireland", cost: 1200 },           // £12.00
  DE: { label: "Germany", cost: 1200 },
  FR: { label: "France", cost: 1200 },
  IT: { label: "Italy", cost: 1200 },
  ES: { label: "Spain", cost: 1200 },
  NL: { label: "Netherlands", cost: 1200 },
  BE: { label: "Belgium", cost: 1200 },
  AT: { label: "Austria", cost: 1200 },
  CH: { label: "Switzerland", cost: 1200 },
  SE: { label: "Sweden", cost: 1200 },
  DK: { label: "Denmark", cost: 1200 },
  NO: { label: "Norway", cost: 1200 },
};

const DEFAULT_SHIPPING_COST = 2000; // £20.00 in pence
const FREE_SHIPPING_THRESHOLD = 20000; // £200.00 in pence

/**
 * Calculates the shipping cost in pence for a given country and subtotal.
 * @param country — ISO 3166-1 alpha-2 country code
 * @param subtotalInCents — order subtotal in pence/cents
 * @returns shipping cost in pence/cents
 */
export function getShippingCost(
  country: string,
  subtotalInCents: number,
): number {
  // Free shipping for orders over threshold
  if (subtotalInCents >= FREE_SHIPPING_THRESHOLD) return 0;

  const zone = SHIPPING_ZONES[country.toUpperCase()];
  return zone?.cost ?? DEFAULT_SHIPPING_COST;
}

/**
 * Safely normalizes string numeric decimals coming from Database storage engine
 * records into reliable Javascript integers for absolute safety during checkout mathematics.
 * @param decimalString — value from server e.g. "150.50"
 */
export function convertDecimalToPence(decimalString: string | number): number {
  if (typeof decimalString === "number") return Math.round(decimalString * 100);
  const parsed = parseFloat(decimalString);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}