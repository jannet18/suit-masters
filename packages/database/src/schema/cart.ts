import {
  pgTable,
  serial,
  integer,
  uuid,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.js";
import { product, productConfiguration, productItem } from "./products.js";

// Shopping Cart
export const shoppingCart = pgTable("shopping_cart", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping Cart Item
export const shoppingCartItem = pgTable("shopping_cart_item", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => shoppingCart.id),
  productId: integer("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  // For STANDARD products: points to specific SKU
  productItemId: integer("product_item_id").references(() => productItem.id, {
    onDelete: "set null",
  }),
  // For CUSTOM products: points to configuration
  configurationId: integer("configuration_id").references(
    () => productConfiguration.id,
    { onDelete: "cascade" },
  ),
  quantity: integer("qty").notNull().default(1),
  price: integer("price").notNull(), // pence
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart Item (simplified version for new schema)
export const cartItem = pgTable("cart_item", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => product.id, { onDelete: "cascade" })
    .notNull(),
  configurationId: integer("configuration_id").references(
    () => productConfiguration.id,
    { onDelete: "cascade" },
  ),
  measurementProfileId: uuid("measurement_profile_id"),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
