// import { serial, varchar, integer, uuid } from "drizzle-orm/pg-core";
// import { pgTable } from "drizzle-orm/pg-core";
// import { relations } from "drizzle-orm";
// import { timestamps } from "./shared.js";
// import { usersTable } from "./user.js";

// export const country = pgTable("country", {
//   id: serial("id").primaryKey(),
//   country_name: varchar("country_name", { length: 128 }).notNull(),
//   code: varchar("code", { length: 2 }).notNull(),
// });

// export const addressTable = pgTable("address", {
//   id: serial("id").primaryKey(),
//   user_id: uuid("user_id")
//     .references(() => usersTable.id)
//     .notNull(),
//   unit_number: varchar("unit_number", { length: 64 }).notNull(),
//   street_number: varchar("street_number", { length: 64 }).notNull(),
//   address_line1: varchar("address_line1", { length: 255 }).notNull(),
//   address_line2: varchar("address_line2", { length: 255 }).notNull(),
//   city: varchar("city", { length: 128 }).notNull(),
//   region: varchar("region", { length: 128 }).notNull(),
//   postal_code: varchar("postal_code", { length: 16 }).notNull(),
//   country_id: integer("country_id").notNull(),
//   createdAt: timestamps.createdAt,
//   updatedAt: timestamps.updatedAt,
// });

// export const addressRelations = relations(addressTable, ({ one }) => ({
//   country: one(country, {
//     fields: [addressTable.country_id],
//     references: [country.id],
//   }),
// }));
