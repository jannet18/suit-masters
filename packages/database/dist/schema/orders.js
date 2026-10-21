import { index, integer, jsonb, numeric, pgTable, text, timestamp, uuid, varchar, } from "drizzle-orm/pg-core";
import { usersTable } from "./user.js";
import { timestamps } from "./shared.js";
import { product, fabric, productItem } from "./products.js";
import { relations } from "drizzle-orm";
// Money: integer minor units (pence). £199.00 is stored as 19900.
export const shopOrder = pgTable("shop_order", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").references(() => usersTable.id, {
        onDelete: "set null",
    }),
    total: integer("total").notNull(),
    // Price breakdown as charged, all integer pence (total = subtotal -
    // discount - export VAT relief + shipping). Prices are VAT-inclusive;
    // vatTotal is the VAT the total contains (0 for exports).
    subtotal: integer("subtotal"),
    discountTotal: integer("discount_total").default(0).notNull(),
    shippingTotal: integer("shipping_total").default(0).notNull(),
    exportVatRelief: integer("export_vat_relief").default(0).notNull(),
    vatTotal: integer("vat_total").default(0).notNull(),
    promotionCode: varchar("promotion_code", { length: 64 }),
    status: varchar("status", { length: 64 }).notNull(),
    // Shipping snapshot
    shipping_name: varchar("shipping_name", { length: 255 }).notNull(),
    shipping_email: varchar("shipping_email", { length: 255 }).notNull(),
    shipping_phone: varchar("shipping_phone", { length: 32 }).notNull(),
    shipping_address_line1: varchar("shipping_address_line1", {
        length: 255,
    }).notNull(),
    shipping_address_line2: varchar("shipping_address_line2", { length: 255 }),
    shipping_city: varchar("shipping_city", { length: 128 }).notNull(),
    shipping_region: varchar("shipping_region", { length: 128 }).notNull(),
    shipping_postal_code: varchar("shipping_postal_code", {
        length: 16,
    }).notNull(),
    shipping_country: varchar("shipping_country", { length: 64 }).notNull(),
    // Payment & inventory
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
    // Set once the order's reserved stock has been returned (cancel/refund/expiry),
    // so stock is never restored twice.
    stockReleasedAt: timestamp("stock_released_at"),
    // Tracking
    tracking_number: varchar("tracking_number", { length: 128 }),
    tracking_carrier: varchar("tracking_carrier", { length: 64 }),
    // Tailoring-specific fields
    estimated_delivery_date: timestamp("estimated_delivery_date"),
    currency: varchar("currency", { length: 3 }).default("GBP"),
    tailor_notes: text("tailor_notes"),
    priority_level: varchar("priority_level", { length: 20 }).default("standard"),
    // Timestamps
    ...timestamps,
}, (table) => [index("shop_order_user_id_idx").on(table.userId)]);
export const orderItems = pgTable("order_items", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer("order_id")
        .references(() => shopOrder.id, { onDelete: "cascade" })
        .notNull(),
    productNameSnapshot: varchar("product_name").notNull(),
    skuSnapshot: varchar("sku"),
    customizationSnapsot: jsonb("customization_snapshot"),
    measurementSnapshot: jsonb("measurement_snapshot"),
    priceAtPurchase: integer("price_at_purchase").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    // Foreign key references for data integrity
    productId: integer("product_id").references(() => product.id, {
        onDelete: "set null",
    }),
    fabricId: integer("fabric_id").references(() => fabric.id, {
        onDelete: "set null",
    }),
    // SKU the stock was reserved from; null for made-to-order products
    productItemId: integer("product_item_id").references(() => productItem.id, {
        onDelete: "set null",
    }),
    measurementProfileId: uuid("measurement_profile_id"),
    styleType: varchar("style_type", { length: 50 }),
}, (table) => [index("order_items_order_id_idx").on(table.orderId)]);
export const orderMeasurements = pgTable("order_measurements", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderItemId: integer("order_item_id")
        .references(() => orderItems.id, { onDelete: "cascade" })
        .notNull(),
    unit: varchar("unit", { length: 5 }).notNull(),
    height: numeric("height", { precision: 5, scale: 2 }).notNull(),
    chest: numeric("chest", { precision: 5, scale: 2 }).notNull(),
    waist: numeric("waist", { precision: 5, scale: 2 }).notNull(),
    hips: numeric("hips", { precision: 5, scale: 2 }).notNull(),
    inseam: numeric("inseam", { precision: 5, scale: 2 }).notNull(),
    shoulder: numeric("shoulder", { precision: 5, scale: 2 }).notNull(),
    profile_name: varchar("profile_name", { length: 64 }),
}, (table) => [index("order_measurements_item_id_idx").on(table.orderItemId)]);
export const shopOrderRelations = relations(shopOrder, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [shopOrder.userId],
        references: [usersTable.id],
    }),
    items: many(orderItems),
}));
export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
    order: one(shopOrder, {
        fields: [orderItems.orderId],
        references: [shopOrder.id],
    }),
    measurements: many(orderMeasurements),
}));
