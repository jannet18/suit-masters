import { Hono } from "hono";
import type { AuthContext } from "@repo/auth";
import {
  db,
  shopOrder,
  refundRequest,
  refundTimeline,
} from "@repo/db";
import { eq, desc } from "@repo/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia" as any,
});

export const refundRoutes = new Hono<AuthContext>();
/**
 * custom admin authorisation
 */
const isAdmin = async (c:any, next: () => Promise<void>) => {
  const user = c.get("user")
  if(!user || user.role !== "ADMIN"){
    return c.json({
      error: "Access Denied: Unauthorised"
    })
  }
    await next()
}


/**
 * POST /refunds
 * Customer creates a refund/return request.
 */
refundRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    const userId = user?.id ?? null;

    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { orderId, reason, description, quantity } = await c.req.json<{
      orderId: number;
      reason: string;
      description?: string;
      quantity?: number;
    }>();

    if (!orderId || !reason) {
      return c.json({ error: "Order ID and reason are required" }, 400);
    }
const order = await db.query.shopOrder.findFirst({
  where: (table, {and: and, eq: e}) => and(eq(table.id, orderId), eq(table.userId, userId))
})

if(!order) return c.json({error: "Order record not found"}, 404)
  if(!["delivered", "shipped"].includes(order.status)){
    return c.json({error: `Order ineligible for return in status: ${order.status}`}, 400)
  }
    // const validReasons = [
    //   "wrong_size",
    //   "defective",
    //   "not_as_described",
    //   "changed_mind",
    //   "late_delivery",
    //   "other",
    // ];
    // if (!validReasons.includes(reason)) {
    //   return c.json({ error: `Invalid reason. Must be one of: ${validReasons.join(", ")}` }, 400);
    // }

    // // Verify the order belongs to this user and is in a refundable state
    // const order = await db.query.shopOrder.findFirst({
    //   where: (table, { and: andFn, eq: eqFn }) =>
    //     andFn(eqFn(table.id, orderId), eqFn(table.userId, userId)),
    // });

    // if (!order) {
    //   return c.json({ error: "Order not found" }, 404);
    // }

    // const refundableStatuses = ["delivered", "shipped"];
    // if (!refundableStatuses.includes(order.status)) {
    //   return c.json(
    //     { error: `Order cannot be refunded in its current status: ${order.status}` },
    //     400,
    //   );
    // }

    // Check if a pending refund request already exists for this order
    // const existingRequest = await db.query.refundRequest.findFirst({
    //   where: (table, { and: andFn, eq: eqFn }) =>
    //     andFn(
    //       eqFn(table.orderId, orderId),
    //       eqFn(table.userId, userId),
    //     ),
    // });

    // if (existingRequest && (existingRequest.status === "requested" || existingRequest.status === "approved" || existingRequest.status === "processing")) {
    //   return c.json(
    //     { error: "A refund request is already in progress for this order" },
    //     400,
    //   );
    // }

    // // Calculate refund amount
    // const refundAmount = order.total;

// Database insertion wrapped alongside timeline tracking inside a unified transaction
 const result = await db.transaction(async (tx) => {
  const [newRefund] = await tx.insert(refundRequest).values({
    orderId, userId, status: "Requested",
    reason, description: description || null,
    quantity: quantity || 1,
    refundAmount: order.total
  }).returning()
  if (!newRefund || !newRefund.id) {
    throw new Error("Failed to create refund request")
  }

  await tx.insert(refundTimeline).values({
    refundRequestId: newRefund.id,
    action: "Created",
    notes: `Refund initialized for reason code: ${reason}`,
    performedBy: userId
  })
  return newRefund
 })    
    // const [newRefund] = await db
    //   .insert(refundRequest)
    //   .values({
    //     orderId,
    //     userId,
    //     status: "requested",
    //     reason,
    //     description: description || null,
    //     quantity: quantity || 1,
    //     refundAmount: refundAmount,
    //   })
    //   .returning();

    // if (!newRefund) {
    //   return c.json({ error: "Failed to create refund request" }, 500);
    // }

    // // Create timeline entry
    // await db.insert(refundTimeline).values({
    //   refundRequestId: newRefund.id,
    //   action: "created",
    //   notes: `Refund request created. Reason: ${reason}`,
    //   performedBy: userId,
    // });

    return c.json({
      success: true,
      refundRequest: {
       result},
      message: "Refund request submitted successfully",
    }, 201);
  } catch (error) {
    console.error("Failed to create refund request:", error);
    return c.json({ error: "Failed to create refund request" }, 500);
  }
});

/**
 * GET /refunds
 * Customer fetches their refund requests.
 */
refundRoutes.get("/", async (c) => {
  try {
    const user = c.get("user");
    const userId = user?.id ?? null;

    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const refunds = await db.query.refundRequest.findMany({
      where: (table, { eq: eqFn }) => eqFn(table.userId, userId),
      orderBy: [desc(refundRequest.id)],
    });

    return c.json({ success: true, refunds });
  } catch (error) {
    console.error("Failed to fetch refunds:", error);
    return c.json({ success: false, refunds: [], error: "Failed to fetch refunds" }, 500);
  }
});

/**
 * GET /refunds/:id
 * Fetch a single refund request with timeline.
 */
refundRoutes.get("/:id", async (c) => {
  try {
    const user = c.get("user");
    const userId = user?.id ?? null;
    const refundId = Number(c.req.param("id"));

    const refund = await db.query.refundRequest.findFirst({
      where: (table, { and: andFn, eq: eqFn }) =>
        andFn(eqFn(table.id, refundId), eqFn(table.userId, userId)),
    });

    if (!refund) {
      return c.json({ error: "Refund request not found" }, 404);
    }

    // Fetch timeline
    const timeline = await db.query.refundTimeline.findMany({
      where: (table, { eq: eqFn }) => eqFn(table.refundRequestId, refundId),
      orderBy: [desc(refundTimeline.id)],
    });

    return c.json({ success: true, refund, timeline });
  } catch (error) {
    console.error("Failed to fetch refund:", error);
    return c.json({ error: "Failed to fetch refund" }, 500);
  }
});

/**
 * PUT /refunds/:id/approve
 * Secure Admin approves a refund request and processes Stripe refund.
 */
refundRoutes.put("/:id/approve", async (c) => {
  try {
    const refundId = Number(c.req.param("id"));
    const user = c.get("user");
    const { adminNotes } = await c.req.json<{ adminNotes?: string }>();

    const refund = await db.query.refundRequest.findFirst({
      where: (table, { eq: eqFn }) => eqFn(table.id, refundId),
    });

    if (!refund || refund.status !== "requested") {
      return c.json({ error: "Valid Refund request not found" }, 404);
    }

    const order = await db.query.shopOrder.findFirst({
      where: (table, { eq: eqFn }) => eqFn(table.id, refund.orderId),
    });

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const paymentIntentId = (order as any).stripePaymentId;
    if (!paymentIntentId) {
      return c.json({ error: "No valid payment for this order" }, 400);
    }

    try {
      // Process payment reversal on gateway before changing database state
      const refundResult = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(Number(refund.refundAmount) * 100),
      });

      await db.transaction(async (tx) => {
        await tx.update(refundRequest)
          .set({
            status: "processing",
            adminNotes: adminNotes || "Approved",
            processedBy: user.id,
            stripeRefundId: refundResult.id,
          })
          .where(eq(refundRequest.id, refundId));

        await tx.insert(refundTimeline).values({
          refundRequestId: refundId,
          action: "approved",
          notes: adminNotes || "Refund processed successfully",
          performedBy: user?.id,
        });
      });

      return c.json({
        success: true,
        message: "Refund approved successfully",
      });
    } catch (stripeError: any) {
      console.error("Stripe refund failed:", stripeError);
      return c.json({ error: `Refund failed: ${stripeError.message}` }, 500);
    }
  } catch (error) {
    console.error("Failed to approve refund:", error);
    return c.json({ error: "Failed to approve refund" }, 500);
  }
});

/**
 * PUT /refunds/:id/reject
 * Admin rejects a refund request.
 */
refundRoutes.put("/:id/reject", async (c) => {
  try {
    const refundId = Number(c.req.param("id"));
    const user = c.get("user");
    const { adminNotes } = await c.req.json<{ adminNotes?: string }>();

    const refund = await db.query.refundRequest.findFirst({
      where: (table, { eq: eqFn }) => eqFn(table.id, refundId),
    });

    if (!refund) {
      return c.json({ error: "Refund request not found" }, 404);
    }

    if (refund.status !== "requested") {
      return c.json({ error: `Cannot reject refund in status: ${refund.status}` }, 400);
    }

    await db
      .update(refundRequest)
      .set({
        status: "rejected",
        adminNotes: adminNotes || null,
        processedBy: user?.id || "admin",
        processedAt: new Date(),
      })
      .where(eq(refundRequest.id, refundId));

    // Create timeline entry
    await db.insert(refundTimeline).values({
      refundRequestId: refundId,
      action: "rejected",
      notes: adminNotes || "Refund rejected by admin",
      performedBy: user?.id || "admin",
    });

    // Update order status to refunded
    await db
      .update(shopOrder)
      .set({ status: "refunded" })
      .where(eq(shopOrder.id, refund.orderId));

    return c.json({
      success: true,
      message: "Refund request rejected",
    });
  } catch (error) {
    console.error("Failed to reject refund:", error);
    return c.json({ error: "Failed to reject refund" }, 500);
  }
});

/**
 * PUT /refunds/:id/complete
 * Admin marks a refund as completed (after confirming money was returned).
 */
refundRoutes.put("/:id/complete", async (c) => {
  try {
    const refundId = Number(c.req.param("id"));
    const user = c.get("user");

    const refund = await db.query.refundRequest.findFirst({
      where: (table, { eq: eqFn }) => eqFn(table.id, refundId),
    });

    if (!refund) {
      return c.json({ error: "Refund request not found" }, 404);
    }

    if (refund.status !== "processing") {
      return c.json({ error: `Cannot complete refund in status: ${refund.status}` }, 400);
    }

    await db
      .update(refundRequest)
      .set({
        status: "completed",
        processedBy: user?.id || "admin",
        processedAt: new Date(),
      })
      .where(eq(refundRequest.id, refundId));

    // Update order status
    await db
      .update(shopOrder)
      .set({ status: "refunded" })
      .where(eq(shopOrder.id, refund.orderId));

    // Create timeline entry
    await db.insert(refundTimeline).values({
      refundRequestId: refundId,
      action: "completed",
      notes: "Refund completed — money returned to customer",
      performedBy: user?.id || "admin",
    });

    return c.json({
      success: true,
      message: "Refund completed",
    });
  } catch (error) {
    console.error("Failed to complete refund:", error);
    return c.json({ error: "Failed to complete refund" }, 500);
  }
});

/**
 * GET /refunds/admin/all
 * Admin fetches all refund requests.
 */
refundRoutes.get("/admin/all", async (c) => {
  try {
    const refunds = await db.query.refundRequest.findMany({
      orderBy: [desc(refundRequest.id)],
      limit: 100,
    });

    return c.json({ success: true, refunds });
  } catch (error) {
    console.error("Failed to fetch all refunds:", error);
    return c.json({ success: false, refunds: [], error: "Failed to fetch refunds" }, 500);
  }
});