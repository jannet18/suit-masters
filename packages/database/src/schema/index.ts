// export * from "./address.js";
// export * from "./cart.js";
// export { orderItems, shopOrder } from "./orders.js";
// export * from "./orders.js";
// export * from "./payments.js";
// export * from "./products.js";
// export * from "./promotions.js";
// export * from "./shared.js";
// export * from "./user.js";
// export * from "./collection.js";
// export { idempotencyKeys } from "./idempotency.js";
// export * from "./relations.js";
import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  text,
  uuid,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- ENUMS & CONSTANTS ---
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "production",
  "quality_check",
  "shipped",
  "delivered",
  "cancelled",
]);

// --- 1. FABRIC & CATEGORY ---
export const fabric = pgTable("fabric", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  sku: varchar("sku", { length: 64 }).unique().notNull(),
  composition: varchar("composition", { length: 255 }),
  weight: varchar("weight", { length: 64 }),
  brand: varchar("brand", { length: 64 }),
  imageUrl: varchar("image_url", { length: 255 }),
  isActive: boolean("is_active").default(true),
});

export const productCategory = pgTable("product_category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).unique().notNull(),
  parentId: integer("parent_id"), // Self-reference for sub-categories
});

// --- 2. PRODUCT & CONFIGURATION ---
export const product = pgTable("product", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => productCategory.id)
    .notNull(),
  fabricId: integer("fabric_id")
    .references(() => fabric.id)
    .notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).unique().notNull(),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  mainImage: varchar("main_image", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
});

export const customizationGroup = pgTable("customization_group", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => productCategory.id)
    .notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  isRequired: boolean("is_required").default(true),
  displayOrder: integer("display_order").default(0),
});

export const customizationOption = pgTable("customization_option", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .references(() => customizationGroup.id)
    .notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  priceDelta: numeric("price_delta", { precision: 12, scale: 2 }).default(
    "0.00",
  ),
  thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
  factoryCode: varchar("factory_code", { length: 32 }),
});

export const productConfiguration = pgTable("product_configuration", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: integer("product_id")
    .references(() => product.id)
    .notNull(),
  selectedOptions: jsonb("selected_options")
    .$type<Record<string, number>>()
    .notNull(),
  finalPrice: numeric("final_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- 3. USERS & MEASUREMENTS ---
export const siteUsers = pgTable("site_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  kindeId: varchar("kinde_id").unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userMeasurementProfile = pgTable("user_measurement_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => siteUsers.id)
    .notNull(),
  profileName: varchar("profile_name", { length: 64 }).notNull(),
  unit: varchar("unit", { length: 8 }).notNull(), // 'cm' or 'inch'
  height: numeric("height", { precision: 5, scale: 2 }),
  weight: numeric("weight", { precision: 5, scale: 2 }),
  neck: numeric("neck", { precision: 5, scale: 2 }),
  chest: numeric("chest", { precision: 5, scale: 2 }),
  shoulder: numeric("shoulder", { precision: 5, scale: 2 }),
  waist: numeric("waist", { precision: 5, scale: 2 }),
  hip: numeric("hip", { precision: 5, scale: 2 }),
  sleeve: numeric("sleeve", { precision: 5, scale: 2 }),
  inseam: numeric("inseam", { precision: 5, scale: 2 }),
  isDefault: boolean("is_default").default(false),
});

// --- 4. ORDERS & CART ---
export const shopOrder = pgTable("shop_order", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => siteUsers.id),
  status: orderStatusEnum("status").default("pending"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  shippingName: varchar("shipping_name", { length: 255 }).notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItem = pgTable("order_item", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => shopOrder.id)
    .notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  fabricSnapshot: jsonb("fabric_snapshot").notNull(),
  configurationSnapshot: jsonb("configuration_snapshot").notNull(),
  measurementSnapshot: jsonb("measurement_snapshot").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
});

export const cartItem = pgTable("cart_item", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => siteUsers.id)
    .notNull(),
  configurationId: uuid("configuration_id")
    .references(() => productConfiguration.id)
    .notNull(),
  measurementProfileId: uuid("measurement_profile_id").references(
    () => userMeasurementProfile.id,
  ),
  qty: integer("qty").default(1).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- FABRIC & CATEGORY RELATIONS ---
export const fabricRelations = relations(fabric, ({ many }) => ({
  products: many(product),
}));

export const productCategoryRelations = relations(
  productCategory,
  ({ one, many }) => ({
    parent: one(productCategory, {
      fields: [productCategory.parentId],
      references: [productCategory.id],
      relationName: "sub_categories",
    }),
    subCategories: many(productCategory, { relationName: "sub_categories" }),
    products: many(product),
    customizationGroups: many(customizationGroup),
  }),
);

// --- PRODUCT & CONFIGURATION RELATIONS ---
export const productRelations = relations(product, ({ one, many }) => ({
  category: one(productCategory, {
    fields: [product.categoryId],
    references: [productCategory.id],
  }),
  fabric: one(fabric, {
    fields: [product.fabricId],
    references: [fabric.id],
  }),
  configurations: many(productConfiguration),
}));

export const customizationGroupRelations = relations(
  customizationGroup,
  ({ one, many }) => ({
    category: one(productCategory, {
      fields: [customizationGroup.categoryId],
      references: [productCategory.id],
    }),
    options: many(customizationOption),
  }),
);

export const customizationOptionRelations = relations(
  customizationOption,
  ({ one }) => ({
    group: one(customizationGroup, {
      fields: [customizationOption.groupId],
      references: [customizationGroup.id],
    }),
  }),
);

export const productConfigurationRelations = relations(
  productConfiguration,
  ({ one }) => ({
    product: one(product, {
      fields: [productConfiguration.productId],
      references: [product.id],
    }),
  }),
);

// --- USER & MEASUREMENT RELATIONS ---
export const siteUsersRelations = relations(siteUsers, ({ many }) => ({
  measurements: many(userMeasurementProfile),
  orders: many(shopOrder),
  cartItems: many(cartItem),
}));

export const userMeasurementProfileRelations = relations(
  userMeasurementProfile,
  ({ one }) => ({
    user: one(siteUsers, {
      fields: [userMeasurementProfile.userId],
      references: [siteUsers.id],
    }),
  }),
);

// --- ORDER & CART RELATIONS ---
export const shopOrderRelations = relations(shopOrder, ({ one, many }) => ({
  user: one(siteUsers, {
    fields: [shopOrder.userId],
    references: [siteUsers.id],
  }),
  items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(shopOrder, {
    fields: [orderItem.orderId],
    references: [shopOrder.id],
  }),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  user: one(siteUsers, {
    fields: [cartItem.userId],
    references: [siteUsers.id],
  }),
  configuration: one(productConfiguration, {
    fields: [cartItem.configurationId],
    references: [productConfiguration.id],
  }),
  measurement: one(userMeasurementProfile, {
    fields: [cartItem.measurementProfileId],
    references: [userMeasurementProfile.id],
  }),
}));

export const categoryRelations = relations(productCategory, ({ many }) => ({
  products: many(product),
  customizationGroups: many(customizationGroup), // Ensure this matches your table name
}));
