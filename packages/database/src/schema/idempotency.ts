import { pgTable, serial, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./user.js";

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").notNull().unique(),
  userId: uuid("user_id").references(() => usersTable.id, {onDelete: "cascade"}).notNull(),
  orderId: integer("order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

