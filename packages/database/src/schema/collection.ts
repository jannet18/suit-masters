import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./shared.js";
import { product, productCategory } from "./products.js";

export const collection = pgTable("collection", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  category_id: integer("category_id")
    .notNull()
    .references(() => productCategory.id),
  description: varchar("description", { length: 255 }),
  image: varchar("image", { length: 255 }),
  ...timestamps,
});

export const productCollection = pgTable("product_collection", {
  product_id: integer("product_id")
    .notNull()
    .references(() => product.id),

  collection_id: integer("collection_id")
    .notNull()
    .references(() => collection.id),
});

// Wedding → multiple suits
// Suit → Wedding + Boardroom
// Clean many-to-many relationship
