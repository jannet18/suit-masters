import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
  pgEnum,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { shopOrder } from "./orders.js";
import { timestamps } from "./shared.js";
import { usersTable } from "./user.js";

// Refund status enum
export const refundStatusEnum = pgEnum("refund_status", [
  "requested",
  "approved",
  "processing",
  "completed",
  "rejected",
]);

// Return reason enum
export const returnReasonEnum = pgEnum("return_reason", [
  "wrong_size",
  "defective",
  "not_as_described",
  "changed_mind",
  "late_delivery",
  "other",
]);

// Refund / Return requests
export const refundRequest = pgTable("refund_request", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id")
    .references(() => shopOrder.id, {onDelete: "restrict"})
    .notNull(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, {onDelete: "restrict"}),
  // Refund details
  status: refundStatusEnum("status").notNull().default("requested"),
  reason: returnReasonEnum("reason").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  // Financials
  refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }),
  stripeRefundId: varchar("stripe_refund_id", { length: 128 }),
  // Admin fields
  adminNotes: text("admin_notes"),
  processedBy: varchar("processed_by", { length: 128 }),
  processedAt: timestamp("processed_at"),

  ...timestamps,
},(table) => [
  index("refund_request_order_idx").on(table.orderId)
]);

// Refund timeline / audit log
export const refundTimeline = pgTable("refund_timeline", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  refundRequestId: integer("refund_request_id")
    .references(() => refundRequest.id, {onDelete: "cascade"})
    .notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  notes: text("notes"),
  performedBy: varchar("performed_by", { length: 128 }),
  ...timestamps,
}, (table) => [
  index("refund_timeline_request_idx").on(table.refundRequestId)
]);