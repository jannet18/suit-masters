import { NextRequest, NextResponse } from "next/server";

const CART_SERVICE_URL =
  process.env.CART_SERVICE_URL || "http://localhost:4003";

/**
 * GET /api/cart
 * Fetch the current user's server-side cart.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const res = await fetch(`${CART_SERVICE_URL}/cart`, {
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Cart service error:", res.status, body);
      return NextResponse.json(
        { success: false, items: [], error: "Failed to fetch cart" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cart proxy error:", error);
    return NextResponse.json(
      { success: false, items: [], error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/cart
 * Add an item to the server-side cart.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const body = await request.json();

    const res = await fetch(`${CART_SERVICE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Cart add error:", res.status, errorBody);
      return NextResponse.json(
        { success: false, error: "Failed to add item to cart" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cart add proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/cart
 * Update cart item quantity or sync the entire cart.
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const body = await request.json();

    // Sync operation
    if (body.action === "sync") {
      const res = await fetch(`${CART_SERVICE_URL}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ items: body.items }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Cart sync error:", res.status, errorBody);
        return NextResponse.json(
          { success: false, error: "Failed to sync cart" },
          { status: res.status },
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Update quantity
    if (body.itemId && body.quantity) {
      const res = await fetch(`${CART_SERVICE_URL}/update/${body.itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({ quantity: body.quantity }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Cart update error:", res.status, errorBody);
        return NextResponse.json(
          { success: false, error: "Failed to update cart" },
          { status: res.status },
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Cart update proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/cart
 * Remove an item from the server-side cart or clear the entire cart.
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const clearAll = searchParams.get("clear");

    if (clearAll === "true") {
      const res = await fetch(`${CART_SERVICE_URL}/clear`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Cart clear error:", res.status, errorBody);
        return NextResponse.json(
          { success: false, error: "Failed to clear cart" },
          { status: res.status },
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (itemId) {
      const res = await fetch(`${CART_SERVICE_URL}/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Cart remove error:", res.status, errorBody);
        return NextResponse.json(
          { success: false, error: "Failed to remove item" },
          { status: res.status },
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Cart delete proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}