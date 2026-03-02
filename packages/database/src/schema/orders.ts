import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.js";

export const shopOrder = pgTable("shop_order", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  // orderedItems: integer("ordered_items").notNull(),
  // orderDate: timestamp("order_date").defaultNow(),
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
});

// export const orderStatusTable = pgTable("order_status", {
//   id: serial("id").primaryKey(),
//   status: varchar("status", { length: 64 }).notNull(),
// });

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id")
    .references(() => shopOrder.id)
    .notNull(),
  product_id: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  base_price: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  // JSON snapshot of custom options(fabric size)
  selected_options: jsonb("selected_options").notNull(),
  final_price: numeric("final_price", { precision: 12, scale: 2 }).notNull(),
});

export const orderMeasurements = pgTable("order_measurements", {
  id: serial("id").primaryKey(),
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
