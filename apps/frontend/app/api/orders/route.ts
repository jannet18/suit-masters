import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:4001";

/**
 * GET /api/orders
 *
 * Proxies requests to the order-service, keeping internal
 * service URLs hidden from the client. Requires the
 * Better Auth session token forwarded as a Bearer token.
 */
export async function GET(request: NextRequest) {
  try {
    // Forward the Authorization header from the client request
    const cookieHeader = request.headers.get("cookie") || "";

    const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Order service error:", res.status, body);
      return NextResponse.json(
        { success: false, orders: [], error: "Failed to fetch orders" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Order proxy error:", error);
    return NextResponse.json(
      { success: false, orders: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/orders
 * Create an order from the user's server-side cart. The Idempotency-Key header
 * is forwarded so retries don't create duplicate orders. Error responses (e.g.
 * 409 OUT_OF_STOCK) are passed through unchanged so checkout can show them.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const idempotencyKey = request.headers.get("idempotency-key") || "";
    const body = await request.text();

    const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body,
    });

    const data = await res
      .json()
      .catch(() => ({ error: "Failed to create order" }));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Order proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
