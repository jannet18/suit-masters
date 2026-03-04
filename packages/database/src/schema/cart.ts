// import { integer, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
// import { userMeasurements, usersTable } from "./user.js";
// import { product, productConfiguration, productItem } from "./products.js";

// export const shoppingCart = pgTable("shopping_cart", {
//   id: serial("id").primaryKey(),
//   user_id: uuid("user_id")
//     .notNull()
//     .references(() => usersTable.id),
//   updated_at: timestamp("updated_at").defaultNow(),
// });

// export const shoppingCartItem = pgTable("shopping_cart_item", {
//   id: serial("id").primaryKey(),
//   cartId: integer("cart_id")
//     .notNull()
//     .references(() => shoppingCart.id),
//   productId: integer("product_id")
//     .notNull()
//     .references(() => product.id),
//   // If STANDARD: this points to a specific SKU (Size 40, Blue)
//   productItemId: integer("product_item_id")
//     .notNull()
//     .references(() => productItem.id),
//   configurationId: uuid("configuration_id").references(
//     () => productConfiguration.id,
//   ),
//   measurementId: uuid("measurement_id").references(() => userMeasurements.id),
//   quantity: integer("qty").notNull().default(1),
// });
