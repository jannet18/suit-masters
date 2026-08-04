import { NextRequest, NextResponse } from "next/server";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";

/**
 * GET /api/profile
 * Fetch the current user's profile from the database.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${PRODUCT_SERVICE_URL}/config/profile`, {
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Profile service error:", res.status, body);
      return NextResponse.json(
        { success: false, error: "Failed to fetch profile" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/profile
 * Update the current user's profile (name, phone, address).
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const body = await request.json();

    const res = await fetch(`${PRODUCT_SERVICE_URL}/config/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Profile update error:", res.status, errorBody);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile update proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}