import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:4001";

/**
 * POST /api/orders/quote
 * Server-side price for the bag (lines, discount, shipping, VAT, total).
 * Checkout shows this so the displayed total is exactly what gets charged.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const res = await fetch(`${ORDER_SERVICE_URL}/orders/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: await request.text(),
    });
    const data = await res
      .json()
      .catch(() => ({ error: "Failed to price your bag" }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Quote proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
