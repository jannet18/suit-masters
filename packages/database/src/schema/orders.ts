import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const shopOrder = pgTable("shop_order", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  orderedItems: integer("ordered_items").notNull(),
  orderDate: timestamp("order_date").defaultNow(),
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
  selected_options: varchar("selected_options", { length: 400 }),
});
