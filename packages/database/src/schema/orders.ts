import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const shopOrder = pgTable("shop_order", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  orderDate: timestamp("order_date").defaultNow(),
});

// export const orderStatusTable = pgTable("order_status", {
//   id: serial("id").primaryKey(),
//   status: varchar("status", { length: 64 }).notNull(),
// });

// export const shopOrderTable = pgTable("shop_order", {
//   id: serial("id").primaryKey(),
//   user_id: integer("user_id")
//     .notNull()
//     .references(() => usersTable.id),
//   order_date: timestamp("order_date").notNull().defaultNow(),
//   payment_method_id: integer("payment_method_id")
//     .notNull()
//     .references(() => paymentMethodTable.id),
//   shipping_address_id: integer("shipping_address_id")
//     .notNull()
//     .references(() => addressTable.id),
//   shipping_method: integer("shipping_method")
//     .notNull()
//     .references(() => addressTable.id),
//   order_total: numeric("order_total", { precision: 12, scale: 2 }).notNull(),
//   order_status_id: integer("order_status_id")
//     .notNull()
//     .references(() => orderStatusTable.id),
// });

// export const orderLineTable = pgTable("order_line", {
//   order_id: integer("order_id")
//     .notNull()
//     .references(() => shopOrderTable.id),
//   id: serial("id").primaryKey(),
//   product_item_id: integer("product_item_id")
//     .notNull()
//     .references(() => productItem.id),
//   qty: integer("qty").notNull().default(1),
//   price: numeric("price", { precision: 12, scale: 2 }).notNull(),
// });
