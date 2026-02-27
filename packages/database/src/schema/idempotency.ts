import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  userId: integer("user_id").notNull(),
  orderId: integer("order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// headers: {
//   "Idempotency-Key": crypto.randomUUID()
// // }
