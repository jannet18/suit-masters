import { describe, expect, it } from "vitest";
import {
  assertMinorUnits,
  formatCurrency,
  percentOf,
  toMajorString,
  toMajorUnits,
  toMinorUnits,
} from "../money.js";

describe("toMinorUnits", () => {
  it.each([
    ["199.99", 19999],
    ["199", 19900],
    ["199.9", 19990],
    [".5", 50],
    ["0.01", 1],
    ["£1,234.50", 123450],
    [" 12.30 ", 1230],
    ["-2.005", -201],
  ])("parses %j exactly as %i pence", (input, expected) => {
    expect(toMinorUnits(input)).toBe(expected);
  });

  it("avoids floating-point drift on numbers", () => {
    expect(1.005 * 100).not.toBe(100.5); // the bug being guarded against
    expect(toMinorUnits(1.005)).toBe(101);
    expect(toMinorUnits(0.1 + 0.2)).toBe(30);
    expect(toMinorUnits(19.999)).toBe(2000);
    expect(toMinorUnits(1e-7)).toBe(0);
  });

  it.each(["", "abc", "1.2.3", "--1"])("rejects %j", (input) => {
    expect(() => toMinorUnits(input)).toThrow(TypeError);
  });

  it("rejects non-finite numbers", () => {
    expect(() => toMinorUnits(Number.NaN)).toThrow(TypeError);
    expect(() => toMinorUnits(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });
});

describe("formatCurrency", () => {
  it("renders minor units", () => {
    expect(formatCurrency(19900)).toBe("£199.00");
    expect(formatCurrency(5)).toBe("£0.05");
    expect(formatCurrency(0)).toBe("£0.00");
    expect(formatCurrency(-550)).toBe("-£5.50");
    expect(formatCurrency(123456789)).toBe("£1,234,567.89");
  });

  it("supports other currencies and locales", () => {
    expect(formatCurrency(19900, "USD", "en-US")).toBe("$199.00");
    expect(formatCurrency(19900, "EUR", "en-IE")).toBe("€199.00");
  });

  it("refuses amounts that look like pounds", () => {
    expect(() => formatCurrency(199.99)).toThrow(
      /integer number of minor units/,
    );
  });
});

describe("major-unit conversions", () => {
  it("round-trips through strings without loss", () => {
    for (const pence of [0, 1, 99, 100, 19999, 123456]) {
      expect(toMinorUnits(toMajorString(pence))).toBe(pence);
    }
  });

  it("converts to major units only for display integrations", () => {
    expect(toMajorUnits(19999)).toBe(199.99);
    expect(toMajorString(5)).toBe("0.05");
    expect(toMajorString(-12345)).toBe("-123.45");
  });

  it("guards integer-ness", () => {
    expect(() => assertMinorUnits(1.5)).toThrow();
    expect(() => toMajorUnits(1.5)).toThrow();
  });

  it("percentOf rounds half up to whole pence", () => {
    expect(percentOf(33333, 10)).toBe(3333);
    expect(percentOf(54049, 12.5)).toBe(6756);
    expect(percentOf(5, 50)).toBe(3);
  });
});
