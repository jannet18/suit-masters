// import {
//   integer,
//   numeric,
//   pgTable,
//   serial,
//   timestamp,
//   varchar,
// } from "drizzle-orm/pg-core";
// import { timestamps } from "./shared.js";
// import { productCategory } from "./products.js";

// export const promotionTable = pgTable("promotion", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 128 }).notNull(),
//   description: varchar("description", { length: 128 }).notNull(),
//   discount_rate: numeric("discount_rate", {
//     precision: 12,
//     scale: 2,
//   }).notNull(),
//   start_date: timestamp("start_date").notNull(),
//   end_date: timestamp("end_date").notNull(),
//   createdAt: timestamps.createdAt,
//   updatedAt: timestamps.updatedAt,
// });

// export const promotionCategory = pgTable("promotion_category", {
//   category_id: integer("category_id")
//     .notNull()
//     .references(() => productCategory.id),
//   promotion_id: integer("promotion_id")
//     .notNull()
//     .references(() => promotionTable.id),
// });
