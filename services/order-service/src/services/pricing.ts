import { checkPromotion, type Tx, db } from "@repo/db";
import {
  findShippingCountry,
  quote,
  type Promotion,
  type Quote,
} from "@repo/pricing";
import type { CheckoutItem } from "@repo/validation";

/**
 * Prices a checkout from the catalogue. The client only says what was chosen;
 * every price comes from the database, so the amount charged can't be
 * influenced by a tampered cart.
 */

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly code: "PRODUCT_UNAVAILABLE" | "UNSUPPORTED_COUNTRY",
  ) {
    super(message);
  }
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
  promotion: { id: number; code: string } | null;
  /** Why the promo code wasn't applied, if one was given. */
  promoError: string | null;
}

export async function priceCheckout(
  reader: Tx | typeof db,
  {
    items,
    country,
    promoCode,
    userId,
  }: {
    items: CheckoutItem[];
    country: string;
    promoCode?: string;
    userId: string;
  },
): Promise<PricedCheckout> {
  const destination = findShippingCountry(country);
  if (!destination) {
    throw new CheckoutError(
      `Sorry, we don't deliver to ${country} yet`,
      "UNSUPPORTED_COUNTRY",
    );
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await reader.query.product.findMany({
    where: (p, { inArray }) => inArray(p.id, productIds),
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const unavailable = items
    .map((i) => productById.get(i.productId))
    .filter((p) => !p || !p.isActive);
  if (unavailable.length) {
    const names = unavailable.map((p) => p?.name ?? "An item").join(", ");
    throw new CheckoutError(
      `No longer available: ${names}. Remove it from your bag to continue.`,
      "PRODUCT_UNAVAILABLE",
    );
  }

  // Options a product can have are the customisation options of its category
  const categoryIds = [...new Set(products.map((p) => p.categoryId))];
  const groups = await reader.query.customizationGroup.findMany({
    where: (g, { inArray }) => inArray(g.categoryId, categoryIds),
    with: { options: true },
  });

  const lines: PricedLine[] = items.map((item) => {
    const product = productById.get(item.productId)!;
    const available = groups.filter((g) => g.categoryId === product.categoryId);

    const options: PricedLine["customization"]["options"] = [];
    const notes: string[] = [];
    let unitPrice = product.basePrice;

    for (const selection of item.selections) {
      const match = available
        .flatMap((g) => g.options.map((o) => ({ group: g, option: o })))
        .find(
          ({ option }) =>
            option.value === selection || option.name === selection,
        );
      if (!match) {
        notes.push(selection);
        continue;
      }
      unitPrice += match.option.priceDelta;
      options.push({
        group: match.group.name,
        name: match.option.name,
        value: match.option.value,
        priceDelta: match.option.priceDelta,
      });
    }

    return {
      productId: product.id,
      categoryId: product.categoryId,
      name: product.name,
      quantity: item.quantity,
      unitPrice,
      customization: {
        options,
        notes,
        ...(item.size ? { size: item.size } : {}),
      },
      measurements: item.measurements,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  let promotion: Promotion | null = null;
  let applied: PricedCheckout["promotion"] = null;
  let promoError: string | null = null;
  let discountable = subtotal;

  if (promoCode) {
    const check = await checkPromotion(reader, {
      code: promoCode,
      subtotal,
      userId,
    });
    if (!check.ok) {
      promoError = check.error;
    } else {
      const p = check.promotion;
      if (check.categoryIds) {
        discountable = lines
          .filter((l) => check.categoryIds!.includes(l.categoryId))
          .reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      }
      if (
        check.categoryIds &&
        discountable === 0 &&
        p.type !== "free_shipping"
      ) {
        promoError = "This promo code doesn't apply to the items in your bag";
      } else {
        promotion =
          p.type === "percentage"
            ? {
                type: "percentage",
                percentOff: p.percentOff ?? 0,
                maxDiscount: p.maxDiscountAmount,
              }
            : p.type === "fixed_amount"
              ? { type: "fixed_amount", amountOff: p.amountOff ?? 0 }
              : { type: "free_shipping" };
        applied = { id: p.id, code: p.code };
      }
    }
  }

  return {
    lines,
    quote: quote({
      subtotal,
      discountable,
      countryCode: destination.code,
      promotion,
    }),
    promotion: applied,
    promoError,
  };
}
