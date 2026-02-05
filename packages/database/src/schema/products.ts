import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgSchema,
  pgTable,
  serial,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./shared";
// DESIGNER LOGIC
export const productCategory = pgTable("product_category", {
  id: serial("id").primaryKey(),
  // parent_category_id: integer("parent_category_id").notNull(),
  category_name: varchar("category_name", { length: 128 }).notNull(),
});

export const product = pgTable("product", {
  id: serial("id").primaryKey(),
  category_id: integer("category_id")
    .notNull()
    .references(() => productCategory.id),
  name: varchar("name", { length: 128 }).notNull(),
  description: varchar("description", { length: 128 }).notNull(),
  product_image: varchar("product_image", { length: 255 }).notNull(),
  product_type: varchar("product_type", { length: 32 })
    .$type<"STANDARD" | "CUSTOM">()
    .notNull(),

  base_price: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  ...timestamps,
});

// STANDARD ITEMS
export const productItem = pgTable("product_item", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id")
    .notNull()
    .references(() => product.id),
  sku: varchar("sku", { length: 128 }).notNull(),
  stock: integer("stock").notNull(),
  // product_image: varchar("product_image", { length: 255 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
});

// CUSTOMISATION LOGIC
export const customizationGroup = pgTable("customization_group", {
  id: serial("id").primaryKey(),

  product_id: integer("product_id")
    .notNull()
    .references(() => product.id),

  name: varchar("name", { length: 64 }).notNull(), // Fabric, Fit, Lapel
  required: boolean("required").default(true),
  display_order: integer("display_order").notNull(),
});

export const customizationOption = pgTable("customization_option", {
  id: serial("id").primaryKey(),

  group_id: integer("group_id")
    .notNull()
    .references(() => customizationGroup.id),

  value: varchar("value", { length: 128 }).notNull(), // Italian Wool
  price_delta: numeric("price_delta", { precision: 12, scale: 2 }).default("0"),

  metadata: jsonb("metadata"), // images, color, fabric info
  is_default: boolean("is_default").default(false),
});

// export const customizationConstraint = pgTable("customization_constraint", {
//   id: serial("id").primaryKey(),

//   option_id: integer("option_id")
//     .notNull()
//     .references(() => customizationOption.id),

//   incompatible_option_id: integer("incompatible_option_id")
//     .notNull()
//     .references(() => customizationOption.id),

//   reason: varchar("reason", { length: 255 }),
// });

// export const variation = pgTable("variation", {
//   id: serial("id").primaryKey(),
//   variation_id: integer("variation_id")
//     .notNull()
//     .references(() => productItem.id),
//   value: varchar("value", { length: 128 }).notNull(),
// });

// export const variationOption = pgTable("variation_option", {
//   id: serial("id").primaryKey(),
//   variation_id: integer("variation_id")
//     .notNull()
//     .references(() => variation.id),
//   value: varchar("value", { length: 128 }).notNull(),
// });

export const productConfiguration = pgTable("product_configuration", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: integer("product_id").notNull(),
  // Snapshot of selections
  selected_options: jsonb("selected_options").notNull(),

  // Snapshot of price
  final_price: numeric("final_price", { precision: 12, scale: 2 }).notNull(),
  // // variation_option_id: integer("variation_option_id")
  //   .notNull()
  //   .references(() => variationOption.id),
  createdAT: timestamps.createdAt,
});
