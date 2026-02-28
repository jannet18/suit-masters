// 1. Export the database instance
export { db } from "./db.js";
export * from "drizzle-orm";
// 2. Export everything from your schema folders
// Make sure "product", "shoppingCart", etc. are defined in these files
export * from "./schema/address.js";
export * from "./schema/cart.js";
export * from "./schema/orders.js";
export * from "./schema/payments.js";
export * from "./schema/user.js";
export * from "./schema/products.js";
export * from "./schema/promotions.js";
export * from "./schema/shared.js";
export * from "./schema/idempotency.js";
export * from "./schema/collection.js";
// 3. If you have a central schema index, export that too
export * from "./schema/index.js";
