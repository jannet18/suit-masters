import { NextRequest, NextResponse } from "next/server";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";

/**
 * POST /api/promotions
 * Validate a coupon code and return discount details.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${PRODUCT_SERVICE_URL}/promotions/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Promotion validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate coupon" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/promotions
 * Apply a promotion after successful order.
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const body = await request.json();

    const res = await fetch(`${PRODUCT_SERVICE_URL}/promotions/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Promotion apply error:", error);
    return NextResponse.json(
      { error: "Failed to apply promotion" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/promotions
 * List all promotions (admin).
 */
export async function GET() {
  try {
    const res = await fetch(`${PRODUCT_SERVICE_URL}/promotions`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Promotions fetch error:", error);
    return NextResponse.json(
      { success: false, promotions: [] },
      { status: 500 },
    );
  }
}