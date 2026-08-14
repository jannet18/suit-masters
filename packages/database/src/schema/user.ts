import { relations } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  index
} from "drizzle-orm/pg-core";
import { timestamps } from "./shared.js";
import { shopOrder } from "./orders.js";

// IDENTITY & MEASUREMENTS
export const usersTable = pgTable("site_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  kinde_user_id: varchar("kinde_user_id").unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(true),
  name: varchar("name").notNull(),
  picture: varchar("picture", { length: 1024 }).default(""),
  phone: varchar("phone", { length: 20 }).default(""),
  address: text("address").default(""),
  roles: varchar("roles").notNull().default("CUSTOMER"),
  ...timestamps,
});

export const userMeasurements = pgTable("user_measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, {onDelete: "cascade"}),

  profileName: varchar("profile_name", { length: 64 }).notNull(),
  unit: varchar("unit", { length: 5 }).notNull(),
  height: numeric("height", { precision: 5, scale: 2 }).notNull(),
  chest: numeric("chest", { precision: 5, scale: 2 }).notNull(),
  waist: numeric("waist", { precision: 5, scale: 2 }).notNull(),
  hips: numeric("hips", { precision: 5, scale: 2 }).notNull(),
  inseam: numeric("inseam", { precision: 5, scale: 2 }).notNull(),
  shoulder: numeric("shoulder", { precision: 5, scale: 2 }).notNull(),
  isDefault: boolean("is_default").default(false),

  ...timestamps,
}, (table) => [
  index("user_measurement_user_id_idx").on(table.userId),
]);

// Measurement definitions for video guides (Indochino-style)
export const measurementDefinitions = pgTable("measurement_definitions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bodyPart: varchar("body_part", { length: 64 }).notNull().unique(),
  displayName: varchar("display_name", { length: 128 }).notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  displayOrder: integer("display_order").default(0),
  ...timestamps,
});

export const siteUserRelations = relations(usersTable, ({ many }) => ({
  measurements: many(userMeasurements),
  orders: many(shopOrder)
}));

export const userMeasurementsRelations = relations(
  userMeasurements,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userMeasurements.userId],
      references: [usersTable.id],
    }),
  }),
);
export type User = typeof usersTable.$inferSelect;
