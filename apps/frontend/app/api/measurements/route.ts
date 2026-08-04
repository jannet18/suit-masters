import { NextRequest, NextResponse } from "next/server";

const PRODUCT_SERVICE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:4000";

/**
 * GET /api/measurements
 * Proxy to product-service: GET /measurements/profiles
 * Fetches all measurement profiles for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(
      `${PRODUCT_SERVICE_URL}/measurements/profiles`,
      {
        headers: {
          Cookie: cookieHeader,
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxying GET /measurements/profiles:", error);
    return NextResponse.json(
      { success: false, profiles: [], error: "Failed to fetch measurement profiles" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/measurements
 * Proxy to product-service: POST /measurements/profiles
 * Creates a new measurement profile for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";
    const body = await request.json();

    const res = await fetch(
      `${PRODUCT_SERVICE_URL}/measurements/profiles`,
      {
        method: "POST",
        headers: {
          Cookie: cookieHeader,
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxying POST /measurements/profiles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create measurement profile" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/measurements
 * Proxy to product-service: PUT /measurements/profiles/:id
 * Updates an existing measurement profile.
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: "Profile ID is required" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${PRODUCT_SERVICE_URL}/measurements/profiles/${profileId}`,
      {
        method: "PUT",
        headers: {
          Cookie: cookieHeader,
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxying PUT /measurements/profiles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update measurement profile" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/measurements
 * Proxy to product-service: DELETE /measurements/profiles/:id
 * Deletes a measurement profile.
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: "Profile ID is required" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${PRODUCT_SERVICE_URL}/measurements/profiles/${profileId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxying DELETE /measurements/profiles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete measurement profile" },
      { status: 500 },
    );
  }
}
