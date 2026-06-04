import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.js";
import { timestamps } from "./shared.js";
import { product, fabric } from "./products.js";

export const shopOrder = pgTable("shop_order", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").references(() => usersTable.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 64 }).notNull(),

  // Shipping snapshot
  shipping_name: varchar("shipping_name", { length: 255 }).notNull(),
  shipping_email: varchar("shipping_email", { length: 255 }).notNull(),
  shipping_phone: varchar("shipping_phone", { length: 32 }).notNull(),

  shipping_address_line1: varchar("shipping_address_line1", {
    length: 255,
  }).notNull(),
  shipping_address_line2: varchar("shipping_address_line2", { length: 255 }),
  shipping_city: varchar("shipping_city", { length: 128 }).notNull(),
  shipping_region: varchar("shipping_region", { length: 128 }).notNull(),
  shipping_postal_code: varchar("shipping_postal_code", {
    length: 16,
  }).notNull(),
  shipping_country: varchar("shipping_country", { length: 64 }).notNull(),

  // Tailoring-specific fields
  estimated_delivery_date: timestamp("estimated_delivery_date"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  tailor_notes: text("tailor_notes"),
  priority_level: varchar("priority_level", { length: 20 }).default("standard"),

  // Timestamps
  ...timestamps,
});

export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id")
    .references(() => shopOrder.id)
    .notNull(),
  productNameSnapshot: varchar("product_name").notNull(),
  skuSnapshot: varchar("sku"),
  customizationSnapsot: jsonb("customization_snapshot"),
  measurementSnapshot: jsonb("measurement_snapshot"),
  priceAtPurchase: numeric("price_at_purchase", {
    precision: 12,
    scale: 2,
  }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),

  // Foreign key references for data integrity
  productId: integer("product_id").references(() => product.id),
  fabricId: integer("fabric_id").references(() => fabric.id),
  measurementProfileId: uuid("measurement_profile_id"),
  styleType: varchar("style_type", { length: 50 }),
});

export const orderMeasurements = pgTable("order_measurements", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderItemId: integer("order_item_id")
    .references(() => orderItems.id)
    .notNull(),

  unit: varchar("unit", { length: 5 }).notNull(),

  height: numeric("height", { precision: 5, scale: 2 }).notNull(),
  chest: numeric("chest", { precision: 5, scale: 2 }).notNull(),
  waist: numeric("waist", { precision: 5, scale: 2 }).notNull(),
  hips: numeric("hips", { precision: 5, scale: 2 }).notNull(),
  inseam: numeric("inseam", { precision: 5, scale: 2 }).notNull(),
  shoulder: numeric("shoulder", { precision: 5, scale: 2 }).notNull(),
  profile_name: varchar("profile_name", { length: 64 }),
});
