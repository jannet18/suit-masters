import { integer, pgTable, primaryKey, serial, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./shared.js";
import { product } from "./products.js";

export const collection = pgTable("collection", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  image: varchar("image", { length: 255 }),
  ...timestamps,
});

export const productCollection = pgTable("product_collection", {
  product_id: integer("product_id")
    .notNull()
    .references(() => product.id, {onDelete: "cascade"}),

  collection_id: integer("collection_id")
    .notNull()
    .references(() => collection.id, {onDelete: "cascade"}),
}, (table) => [
  primaryKey({columns: [table.product_id, table.collection_id]})
]);

// Wedding → multiple suits
// Suit → Wedding + Boardroom
// Clean many-to-many relationship
