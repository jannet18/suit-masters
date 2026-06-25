import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { timestamps } from "./shared.js";
import { productCategory } from "./products.js";

// Promotion type enum
export const promotionTypeEnum = pgEnum("promotion_type", [
  "percentage",
  "fixed_amount",
  "free_shipping",
]);

// Promotion
export const promotionTable = pgTable("promotion", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  code: varchar("code", { length: 64 }).unique().notNull(),
  description: varchar("description", { length: 255 }),
  type: promotionTypeEnum("type").notNull().default("percentage"),

  // Discount value: percentage (0-100) or fixed amount
  discountRate: numeric("discount_rate", {
    precision: 12,
    scale: 2,
  }).notNull(),

  // Minimum order amount to apply (null = no minimum)
  minOrderAmount: numeric("min_order_amount", {
    precision: 12,
    scale: 2,
  }),

  // Maximum discount amount (for percentage discounts)
  maxDiscountAmount: numeric("max_discount_amount", {
    precision: 12,
    scale: 2,
  }),

  // Usage limits
  usageLimit: integer("usage_limit"), // null = unlimited
  usageCount: integer("usage_count").default(0).notNull(),
  perUserLimit: integer("per_user_limit").default(1),

  // Active dates
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  ...timestamps,
});

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
export const promotionUsage = pgTable("promotion_usage", {
  id: serial("id").primaryKey(),
  promotionId: integer("promotion_id")
    .notNull()
    .references(() => promotionTable.id),
  userId: varchar("user_id", { length: 128 }).notNull(),
  orderId: integer("order_id"),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});