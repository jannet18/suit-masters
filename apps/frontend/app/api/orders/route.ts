import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:4001";

/**
 * GET /api/orders
 *
 * Proxies requests to the order-service, keeping internal
 * service URLs hidden from the client.  Requires the
 * Kinde session token forwarded as a Bearer token.
 */
export async function GET(request: NextRequest) {
  try {
    // Forward the Authorization header from the client request
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
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
