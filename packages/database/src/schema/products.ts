// import {
//   AnyPgColumn,
//   boolean,
//   integer,
//   jsonb,
//   numeric,
//   pgTable,
//   serial,
//   uuid,
//   varchar,
// } from "drizzle-orm/pg-core";
// import { timestamps } from "./shared.js";

// // DESIGNER LOGIC
// export const productCategory = pgTable("product_category", {
//   id: serial("id").primaryKey(),
//   category_name: varchar("category_name", { length: 128 }).notNull(),
//   slug: varchar("slug", { length: 128 }).notNull().unique(),
//   parent_id: integer("parent_id").references(
//     (): AnyPgColumn => productCategory.id,
//   ),
//   ...timestamps,
// });
// // slug = required for /shop/suits
// // timestamps = admin analytics & sorting
// export const fabric = pgTable("fabric", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 128 }).notNull(),
//   sku: varchar("sku", { length: 64 }).unique().notNull(),
//   composition: varchar("composition", { length: 255 }),
//   weight: varchar("weight", { length: 64 }),
//   brand: varchar("brand", { length: 64 }),
//   imageUrl: varchar("image_url", { length: 255 }),
//   isActive: boolean("is_active").default(true),
// });

// export const product = pgTable("product", {
//   id: serial("id").primaryKey(),
//   name: varchar("name", { length: 128 }).notNull(),
//   categoryId: integer("category_id")
//     .notNull()
//     .references(() => productCategory.id),
//   productType: varchar("product_type", { length: 32 })
//     .$type<"STANDARD" | "CUSTOM">()
//     .notNull(),
//   basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
//   slug: varchar("slug", { length: 128 }).notNull().unique(),
//   description: varchar("description", { length: 128 }).notNull(),
//   productImage: varchar("product_image", { length: 255 }).notNull(),

//   isFeatured: boolean("is_featured").default(false),
//   isActive: boolean("is_active").default(true),
//   ...timestamps,
// });

// // slug → product pages /product/navy-3-piece
// // is_featured → replaces "LATEST"
// // is_active → allows disabling without deleting

// // STANDARD ITEMS
// export const productItem = pgTable("product_item", {
//   id: serial("id").primaryKey(),
//   productId: integer("product_id")
//     .notNull()
//     .references(() => product.id),
//   sku: varchar("sku", { length: 128 }).notNull(),
//   stock: integer("stock").notNull(),
//   size: varchar("size", { length: 32 }),
//   // product_image: varchar("product_image", { length: 255 }).notNull(),
//   additionalPrice: numeric("additional_price", {
//     precision: 12,
//     scale: 2,
//   }).default("0.00"),
// });
// // Ready-made sizes
// // Standard suits
// // Physical inventory

// // CUSTOMISATION LOGIC
// export const customizationGroup = pgTable("customization_group", {
//   id: serial("id").primaryKey(),
//   productId: integer("product_id")
//     .notNull()
//     .references(() => product.id),

//   name: varchar("name", { length: 64 }).notNull(), // Fabric, Fit, Lapel
//   isRequired: boolean("required").default(true),
//   displayOrder: integer("display_order").notNull(),
// });

// export const customizationOption = pgTable("customization_option", {
//   id: serial("id").primaryKey(),
//   // product_id: integer("product_id")
//   //   .notNull()
//   //   .references(() => product.id),
//   group_id: integer("group_id")
//     .notNull()
//     .references(() => customizationGroup.id),
//   name: varchar("name", { length: 128 }).notNull(),
//   value: varchar("value", { length: 128 }).notNull(), // Italian Wool
//   priceDelta: numeric("price_delta", { precision: 12, scale: 2 }).default(
//     "0.00",
//   ),
//   metadata: jsonb("metadata"), // images, color, fabric info
//   isDefault: boolean("is_default").default(false),
// });

// export const productConfiguration = pgTable("product_configuration", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   // kinde_user_id: varchar("user_id").notNull(),
//   productId: integer("product_id").notNull(),
//   // Snapshot of selections
//   selectedOptions: jsonb("selected_options").notNull(),

//   // Snapshot of price
//   totalPrice: numeric("final_price", { precision: 12, scale: 2 }).notNull(),

//   ...timestamps,
// });
