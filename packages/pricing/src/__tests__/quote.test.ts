import { describe, expect, it } from "vitest";
import {
  findShippingCountry,
  quote,
  discountFor,
  FREE_SHIPPING_THRESHOLD,
} from "../index.js";

const amounts = (q: ReturnType<typeof quote>) => ({
  subtotal: q.subtotal,
  discount: q.discount,
  shipping: q.shipping,
  exportVatRelief: q.exportVatRelief,
  vatIncluded: q.vatIncluded,
  total: q.total,
});

describe("quote: shipping and VAT per destination", () => {
  it("UK: VAT-inclusive, £5 shipping under the free-shipping threshold", () => {
    expect(amounts(quote({ subtotal: 15000, countryCode: "GB" }))).toEqual({
      subtotal: 15000,
      discount: 0,
      shipping: 500,
      exportVatRelief: 0,
      vatIncluded: 2583,
      total: 15500,
    });
  });

  it("UK: free shipping at the threshold", () => {
    const q = quote({ subtotal: FREE_SHIPPING_THRESHOLD, countryCode: "GB" });
    expect(q.shipping).toBe(0);
    expect(q.total).toBe(FREE_SHIPPING_THRESHOLD);
  });

  it("Europe: export removes UK VAT, £12 shipping", () => {
    expect(amounts(quote({ subtotal: 5000, countryCode: "DE" }))).toEqual({
      subtotal: 5000,
      discount: 0,
      shipping: 1200,
      exportVatRelief: 833,
      vatIncluded: 0,
      total: 5367,
    });
  });

  it("Rest of world: export, £20 shipping", () => {
    const q = quote({ subtotal: 5000, countryCode: "US" });
    expect([q.isExport, q.shipping, q.exportVatRelief, q.total]).toEqual([
      true,
      2000,
      833,
      6167,
    ]);
  });

  it("accepts country names and codes", () => {
    expect(
      quote({ subtotal: 100, countryCode: "united kingdom" }).countryCode,
    ).toBe("GB");
    expect(findShippingCountry("Narnia")).toBeNull();
    expect(() => quote({ subtotal: 100, countryCode: "Narnia" })).toThrow(
      /don't ship/,
    );
  });
});

describe("quote: promotions", () => {
  it("percentage discount, capped at maxDiscount", () => {
    expect(
      quote({
        subtotal: 60000,
        countryCode: "GB",
        promotion: { type: "percentage", percentOff: 10 },
      }).discount,
    ).toBe(6000);
    expect(
      quote({
        subtotal: 60000,
        countryCode: "GB",
        promotion: { type: "percentage", percentOff: 50, maxDiscount: 7525 },
      }).discount,
    ).toBe(7525);
  });

  it("fixed discount never exceeds what it applies to", () => {
    const q = quote({
      subtotal: 5000,
      countryCode: "GB",
      promotion: { type: "fixed_amount", amountOff: 8000 },
    });
    expect([q.discount, q.shipping, q.total]).toEqual([5000, 0, 0]);
  });

  it("category-limited promotions only discount the eligible part", () => {
    const q = quote({
      subtotal: 59000,
      discountable: 5000,
      countryCode: "GB",
      promotion: { type: "percentage", percentOff: 20 },
    });
    expect(q.discount).toBe(1000);
  });

  it("free-shipping promotion", () => {
    const q = quote({
      subtotal: 5000,
      countryCode: "US",
      promotion: { type: "free_shipping" },
    });
    expect(q.shipping).toBe(0);
  });

  it("discount drops the order below the free-shipping threshold", () => {
    const q = quote({
      subtotal: 21000,
      countryCode: "GB",
      promotion: { type: "fixed_amount", amountOff: 2000 },
    });
    expect([q.discount, q.shipping, q.total]).toEqual([2000, 500, 19500]);
  });

  it("no promotion means no discount", () => {
    expect(discountFor(null, 10000)).toBe(0);
  });
});

describe("quote: integer invariants", () => {
  it("every amount is an integer and the total adds up", () => {
    for (const subtotal of [1, 99, 12345, 19999, 54049, 1_000_001]) {
      for (const countryCode of ["GB", "FR", "JP"]) {
        const q = quote({
          subtotal,
          countryCode,
          promotion: { type: "percentage", percentOff: 12.5 },
        });
        for (const value of Object.values(amounts(q)))
          expect(Number.isInteger(value)).toBe(true);
        expect(q.total).toBe(
          q.subtotal - q.discount - q.exportVatRelief + q.shipping,
        );
      }
    }
  });

  it("rejects a subtotal in pounds", () => {
    expect(() => quote({ subtotal: 199.99, countryCode: "GB" })).toThrow();
  });
});
