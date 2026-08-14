import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:4001";

/**
 * GET /api/orders/:id
 * Fetch a single order by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const res = await fetch(`${ORDER_SERVICE_URL}/orders/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Order service error:", res.status, body);
      return NextResponse.json(
        { success: false, error: "Failed to fetch order" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Order proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/orders/:id
 * Update order status (admin use).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get("cookie") || "";
    const body = await request.json();

    const res = await fetch(`${ORDER_SERVICE_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Order status update error:", res.status, errorBody);
      return NextResponse.json(
        { success: false, error: "Failed to update order status" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Order status update proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}