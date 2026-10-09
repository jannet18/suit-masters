import { NextRequest, NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:4002";

/**
 * POST /api/payments/create-intent
 * Proxies to the payment-service to get a Stripe client secret for an order.
 * The amount is always taken from the stored order, never from the client.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const { orderId } = await request.json();

    const res = await fetch(`${PAYMENT_SERVICE_URL}/payments/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await res
      .json()
      .catch(() => ({ error: "Failed to start payment" }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Payment proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
