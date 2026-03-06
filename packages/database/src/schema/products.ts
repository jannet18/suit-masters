import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  boolean,
  text,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

// Product type enum
export const productTypeEnum = pgEnum("product_type", ["STANDARD", "CUSTOM"]);

// Product Category
export const productCategory = pgTable("product_category", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).unique().notNull(),
  parentId: integer("parent_id"), // Self-reference for sub-categories
});

// Fabric
export const fabric = pgTable("fabric", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 128 }).notNull(),
  sku: varchar("sku", { length: 64 }).unique().notNull(),
  composition: varchar("composition", { length: 255 }),
  weight: varchar("weight", { length: 64 }),
  brand: varchar("brand", { length: 64 }),
  imageUrl: varchar("image_url", { length: 255 }),
  isActive: boolean("is_active").default(true),
});

// Product
export const product = pgTable("product", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id")
    .references(() => productCategory.id)
    .notNull(),
  fabricId: integer("fabric_id")
    .references(() => fabric.id)
    .notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).unique().notNull(),
  productType: productTypeEnum("product_type").notNull().default("CUSTOM"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  mainImage: varchar("main_image", { length: 255 }),
  productImage: varchar("product_image", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
});

// Customization Group
export const customizationGroup = pgTable("customization_group", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id")
    .references(() => productCategory.id)
    .notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  isRequired: boolean("is_required").default(true),
  displayOrder: integer("display_order").default(0),
});

// Customization Option
export const customizationOption = pgTable("customization_option", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: integer("group_id")
    .references(() => customizationGroup.id)
    .notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  value: varchar("value", { length: 128 }),
  priceDelta: numeric("price_delta", { precision: 12, scale: 2 }).default(
    "0.00",
  ),
  thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }),
  texture: varchar("texture", { length: 128 }),
  metadata: jsonb("metadata").$type<{
    origin?: string;
    description?: string;
    composition?: string;
    weight?: string;
  }>(),
  factoryCode: varchar("factory_code", { length: 32 }),
});

// Product Configuration (for custom products)
export const productConfiguration = pgTable("product_configuration", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id")
    .references(() => product.id)
    .notNull(),
  selectedOptions: text("selected_options").$type<Record<string, any>>(),
  finalPrice: numeric("final_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  kindeUserId: varchar("kinde_user_id"),
});

// For backward compatibility with existing code
export const productItem = pgTable("product_item", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id")
    .references(() => product.id)
    .notNull(),
  sku: varchar("sku", { length: 64 }).unique().notNull(),
  size: varchar("size", { length: 16 }),
  color: varchar("color", { length: 64 }),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
});

// Import timestamp function
import { timestamp } from "drizzle-orm/pg-core";
