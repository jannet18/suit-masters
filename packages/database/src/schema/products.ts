import {
  AnyPgColumn,
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./shared.js";

// DESIGNER LOGIC
export const productCategory = pgTable("product_category", {
  id: serial("id").primaryKey(),
  category_name: varchar("category_name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  parent_id: integer("parent_id").references(
    (): AnyPgColumn => productCategory.id,
  ),
  ...timestamps,
});
// slug = required for /shop/suits
// timestamps = admin analytics & sorting

export const product = pgTable("product", {
  id: serial("id").primaryKey(),
  category_id: integer("category_id")
    .notNull()
    .references(() => productCategory.id),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: varchar("description", { length: 128 }).notNull(),
  product_image: varchar("product_image", { length: 255 }).notNull(),
  product_type: varchar("product_type", { length: 32 })
    .$type<"STANDARD" | "CUSTOM">()
    .notNull(),
  base_price: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  is_featured: boolean("is_featured").default(false),
  is_active: boolean("is_active").default(true),
  ...timestamps,
});

// slug → product pages /product/navy-3-piece
// is_featured → replaces "LATEST"
// is_active → allows disabling without deleting

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
// Ready-made sizes
// Standard suits
// Physical inventory

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
  product_id: integer("product_id")
    .notNull()
    .references(() => product.id),
  group_id: integer("group_id")
    .notNull()
    .references(() => customizationGroup.id),

  value: varchar("value", { length: 128 }).notNull(), // Italian Wool
  price_delta: integer("price_delta").default(0),

  metadata: jsonb("metadata"), // images, color, fabric info
  is_default: boolean("is_default").default(false),
});

export const productConfiguration = pgTable("product_configuration", {
  id: uuid("id").primaryKey().defaultRandom(),
  kinde_user_id: varchar("user_id").notNull(),
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
