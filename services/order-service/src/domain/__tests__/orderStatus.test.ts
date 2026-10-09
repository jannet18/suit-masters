import { describe, expect, it } from "vitest";
import {
  FULFILMENT_FLOW,
  ORDER_STATUSES,
  allowedTransitions,
  canTransition,
  isOrderStatus,
} from "../orderStatus.js";

describe("order status transitions", () => {
  it("walks the full fulfilment sequence one step at a time", () => {
    for (let i = 0; i < FULFILMENT_FLOW.length - 1; i++) {
      expect(canTransition(FULFILMENT_FLOW[i]!, FULFILMENT_FLOW[i + 1]!)).toBe(
        true,
      );
    }
  });

  it("allows skipping ahead but never going back", () => {
    expect(canTransition("paid", "in_production")).toBe(true);
    expect(canTransition("confirmed", "shipped")).toBe(true);
    expect(canTransition("shipped", "processing")).toBe(false);
    expect(canTransition("delivered", "paid")).toBe(false);
  });

  it("only Stripe can take an order out of pending", () => {
    expect(allowedTransitions("pending")).toEqual(["cancelled"]);
    expect(canTransition("pending", "paid")).toBe(false);
    expect(canTransition("pending", "shipped")).toBe(false);
    expect(canTransition("payment_failed", "processing")).toBe(false);
  });

  it("payment review and disputes are resolved by an admin", () => {
    expect(allowedTransitions("payment_review")).toEqual([
      "paid",
      "cancelled",
      "refunded",
    ]);
    expect(allowedTransitions("disputed")).toEqual(["paid", "refunded"]);
  });

  it("can be cancelled until it ships, refunded at any paid stage", () => {
    expect(canTransition("in_production", "cancelled")).toBe(true);
    expect(canTransition("quality_check", "cancelled")).toBe(true);
    expect(canTransition("shipped", "cancelled")).toBe(false);
    expect(canTransition("delivered", "cancelled")).toBe(false);
    for (const status of FULFILMENT_FLOW)
      expect(canTransition(status, "refunded")).toBe(true);
  });

  it("cancelled and refunded are terminal", () => {
    for (const terminal of ["cancelled", "refunded"]) {
      expect(allowedTransitions(terminal)).toEqual([]);
      for (const status of ORDER_STATUSES)
        expect(canTransition(terminal, status)).toBe(false);
    }
  });

  it("delivered can only be refunded", () => {
    expect(allowedTransitions("delivered")).toEqual(["refunded"]);
  });

  it("unknown statuses are rejected", () => {
    expect(isOrderStatus("teleported")).toBe(false);
    expect(allowedTransitions("teleported")).toEqual([]);
    expect(isOrderStatus("in_production")).toBe(true);
  });
});
