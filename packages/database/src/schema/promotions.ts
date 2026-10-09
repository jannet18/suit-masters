import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  uuid,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestamps } from "./shared.js";
import { productCategory } from "./products.js";
import { usersTable } from "./user.js";
import { shopOrder } from "./orders.js";

// Promotion type enum
export const promotionTypeEnum = pgEnum("promotion_type", [
  "percentage",
  "fixed_amount",
  "free_shipping",
]);

// Promotion
export const promotionTable = pgTable(
  "promotion",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 128 }).notNull(),
    code: varchar("code", { length: 64 }).unique().notNull(),
    description: varchar("description", { length: 255 }),
    type: promotionTypeEnum("type").notNull().default("percentage"),
    // Exactly one of these is set, matching `type` (like Stripe coupons):
    // percentage -> percentOff (e.g. 12.5), fixed_amount -> amountOff (pence).
    percentOff: numeric("percent_off", {
      precision: 5,
      scale: 2,
      mode: "number",
    }),
    amountOff: integer("amount_off"),
    // Money: integer pence
    minOrderAmount: integer("min_order_amount"),
    maxDiscountAmount: integer("max_discount_amount"),
    usageLimit: integer("usage_limit"), // null = unlimited
    usageCount: integer("usage_count").default(0).notNull(),
    perUserLimit: integer("per_user_limit").default(1),
    // Active dates
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    check(
      "promotion_discount_matches_type",
      sql`(${table.type} = 'percentage' AND ${table.percentOff} > 0 AND ${table.percentOff} <= 100)
     OR (${table.type} = 'fixed_amount' AND ${table.amountOff} > 0)
     OR ${table.type} = 'free_shipping'`,
    ),
  ],
);

// Promotion-category relationship (optional: restrict to specific categories)
export const promotionCategory = pgTable("promotion_category", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => productCategory.id),
  promotionId: integer("promotion_id")
    .notNull()
    .references(() => promotionTable.id),
});

// Track coupon usage per user
export const promotionUsage = pgTable(
  "promotion_usage",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    promotionId: integer("promotion_id")
      .notNull()
      .references(() => promotionTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    orderId: integer("order_id").references(() => shopOrder.id, {
      onDelete: "set null",
    }),
    usedAt: timestamp("used_at").defaultNow().notNull(),
  },
  (table) => [index("promotion_usage_user_idx").on(table.userId)],
);
