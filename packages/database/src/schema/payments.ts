import {
  boolean,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "./shared";

export const paymentsTypeTable = pgTable("payments_type", {
  id: serial("id").primaryKey(),
  name: varchar("value", { length: 64 }).notNull(),
});

export const paymentMethodTable = pgTable("payment_method", {
  id: serial("id").primaryKey(),
  payment_type_id: integer("payment_type_id")
    .notNull()
    .references(() => paymentsTypeTable.id),
  // user_id: integer("user_id").notNull().references(() => usersTable.id),
  provider: varchar("provider", { length: 128 }).notNull(),
  account_number: varchar("account_number", { length: 128 }).notNull(),
  expiry_date: varchar("expiry_date", { length: 32 }).notNull(),
  is_default: boolean("is_default").notNull().default(false),
  createdAt: timestamps.createdAt,
  updatedAt: timestamps.updatedAt,
});

export const paymentMethodRelations = relations(
  paymentMethodTable,
  ({ one }) => ({
    // user: one(usersTable, {
    //     fields: [paymentMethodTable.user_id],
    //     references: [usersTable.id],
    // }),
    paymentType: one(paymentsTypeTable, {
      fields: [paymentMethodTable.payment_type_id],
      references: [paymentsTypeTable.id],
    }),
  }),
);
