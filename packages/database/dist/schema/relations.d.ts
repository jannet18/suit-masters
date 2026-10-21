export declare const collectionRelations: import("drizzle-orm").Relations<"collection", {
    products: import("drizzle-orm").Many<"product_collection">;
}>;
export declare const productRelations: import("drizzle-orm").Relations<"product", {
    category: import("drizzle-orm").One<"product_category", true>;
    productCollections: import("drizzle-orm").Many<"product_collection">;
    customizationGroups: import("drizzle-orm").Many<"customization_group">;
    items: import("drizzle-orm").Many<"product_item">;
}>;
export declare const productItemRelations: import("drizzle-orm").Relations<"product_item", {
    product: import("drizzle-orm").One<"product", true>;
}>;
export declare const productCollectionRelations: import("drizzle-orm").Relations<"product_collection", {
    product: import("drizzle-orm").One<"product", true>;
    collection: import("drizzle-orm").One<"collection", true>;
}>;
export declare const customizationGroupRelations: import("drizzle-orm").Relations<"customization_group", {
    category: import("drizzle-orm").One<"product_category", true>;
    options: import("drizzle-orm").Many<"customization_option">;
}>;
export declare const customizationOptionRelations: import("drizzle-orm").Relations<"customization_option", {
    group: import("drizzle-orm").One<"customization_group", true>;
}>;
export declare const promotionRelations: import("drizzle-orm").Relations<"promotion", {
    usages: import("drizzle-orm").Many<"promotion_usage">;
}>;
export declare const refundRequestRelations: import("drizzle-orm").Relations<"refund_request", {
    timeline: import("drizzle-orm").Many<"refund_timeline">;
}>;
export declare const refundTimelineRelations: import("drizzle-orm").Relations<"refund_timeline", {
    request: import("drizzle-orm").One<"refund_request", true>;
}>;
//# sourceMappingURL=relations.d.ts.map