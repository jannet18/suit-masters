import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:4001";

/**
 * GET /api/refunds
 * Fetch the current user's refund requests.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const res = await fetch(`${ORDER_SERVICE_URL}/refunds`, {
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Refund service error:", res.status, body);
      return NextResponse.json(
        { success: false, refunds: [], error: "Failed to fetch refunds" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Refund proxy error:", error);
    return NextResponse.json(
      { success: false, refunds: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/refunds
 * Create a new refund request.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const body = await request.json();

    const res = await fetch(`${ORDER_SERVICE_URL}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Refund create error:", res.status, errorBody);
      return NextResponse.json(
        { success: false, error: "Failed to create refund request" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Refund create proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}