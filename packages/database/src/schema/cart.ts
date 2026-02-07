import { integer, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { userMeasurements, usersTable } from "./user";
import { productConfiguration, productItem } from "./products";

// // export const cartItem = pgTable("cart_item", {
// //   id: uuid("id").primaryKey().defaultRandom(),
// //   userId: text("user_id").notNull(),
// //   productId: integer("product_id")
// //     .references(() => product.id)
// //     .notNull(),
// //   // Nullable: Only filled for custom products
// //   configurationId: uuid("configuration_id").references(
// //     () => productConfiguration.id,
// //   ),
// //   quantity: integer("quantity").notNull().default(1),
// //   priceAtEntry: numeric("price_at_entry", {
// //     precision: 10,
// //     scale: 2,
// //   }).notNull(),
// //   ...timestamps,
// // });
// import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
// import { product, productConfiguration } from "./products";

// // 1. THE HEADER: One per user
// export const shoppingCart = pgTable("shopping_cart", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   user_id: text("user_id").notNull().unique(), // One cart per user
//   updated_at: timestamp("updated_at").defaultNow(),
// });

// // 2. THE ITEMS: Many per cart
// export const shoppingCartItem = pgTable("shopping_cart_item", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   cart_id: uuid("cart_id").references(() => shoppingCart.id, { onDelete: "cascade" }).notNull(),

//   // The Product
//   product_item_id: integer("product_item_id").references(() => product.id).notNull(),

//   // The Customizations (Optional for standard items)
//   configuration_id: uuid("configuration_id").references(() => productConfiguration.id),

//   // The Fit (Optional)
//   measurement_id: uuid("measurement_id"), // References your measurements table

//   qty: integer("qty").notNull().default(1),
//   created_at: timestamp("created_at").defaultNow(),
// });

export const shoppingCart = pgTable("shopping_cart", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const shoppingCartItem = pgTable("shopping_cart_item", {
  id: serial("id").primaryKey(),
  cart_id: integer("cart_id")
    .notNull()
    .references(() => shoppingCart.id),
  // Link to a Standard Item OR a Custom Configuration
  product_item_id: integer("product_item_id")
    .notNull()

    .references(() => productItem.id),
  configuration_id: uuid("configuration_id").references(
    () => productConfiguration.id,
  ),
  measurement_id: uuid("measurement_id").references(() => userMeasurements.id),
  qty: integer("qty").notNull().default(1),
});
