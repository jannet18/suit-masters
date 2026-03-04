// import { relations } from "drizzle-orm";
// import { collection, productCollection } from "./collection.js";
// import {
//   customizationGroup,
//   customizationOption,
//   product,
//   productCategory,
// } from "./products.js";

// // 1. Collection Relations (The "Wedding" Vibe)
// export const collectionRelations = relations(collection, ({ many }) => ({
//   productCollections: many(productCollection),
// }));

// // 2. Product Relations (The Core)
// export const productRelations = relations(product, ({ one, many }) => ({
//   category: one(productCategory, {
//     fields: [product.categoryId],
//     references: [productCategory.id],
//   }),
//   // This allows us to see which collections a product belongs to
//   productCollections: many(productCollection),
//   // This links to your Hockerty-style customization groups
//   customizationGroups: many(customizationGroup),
// }));

// // 3. The Many-to-Many Bridge Logic
// export const productCollectionRelations = relations(
//   productCollection,
//   ({ one }) => ({
//     product: one(product, {
//       fields: [productCollection.product_id],
//       references: [product.id],
//     }),
//     collection: one(collection, {
//       fields: [productCollection.collection_id],
//       references: [collection.id],
//     }),
//   }),
// );

// // 4. Customization Logic (The Wizard)
// export const customizationGroupRelations = relations(
//   customizationGroup,
//   ({ one, many }) => ({
//     product: one(product, {
//       fields: [customizationGroup.productId],
//       references: [product.id],
//     }),
//     options: many(customizationOption),
//   }),
// );
