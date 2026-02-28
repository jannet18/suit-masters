import { relations } from "drizzle-orm";
import { boolean, numeric, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./shared.js";

// IDENTITY & MEASUREMENTS
export const usersTable = pgTable("site_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  kinde_user_id: varchar("kinde_user_id").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name").notNull(),
  picture: varchar("picture", { length: 1024 }).default(""),
  roles: varchar("roles").notNull().default("CUSTOMER"),
  ...timestamps,
  // createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userMeasurements = pgTable("user_measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  profileName: varchar("profile_name", { length: 64 }).notNull(), // e.g., "My Slim Fit"
  chest: numeric("chest", { precision: 5, scale: 2 }),
  sleeve: numeric("sleeve", { precision: 5, scale: 2 }),
  waist: numeric("waist", { precision: 5, scale: 2 }),
  isDefault: boolean("is_default").default(false),
  ...timestamps,
});
export const siteUserRelations = relations(usersTable, ({ many }) => ({
  measurements: many(userMeasurements),
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
