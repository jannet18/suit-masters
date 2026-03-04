// import { db } from "./db.js";
// import { product, productCategory, productCollection } from "./schema/index.js";
// import { collection } from "./schema/index.js";
// type NewProduct = typeof product.$inferInsert;

// async function seed() {
//   try {
//     console.log("🧹 Clearing existing data...");

//     // Delete in dependency order to avoid FK issues
//     await db.delete(productCollection).execute();
//     await db.delete(product).execute();
//     await db.delete(collection).execute();
//     await db.delete(productCategory).execute();

//     console.log("✅ Tables cleared");
//     // TOP CATEGORIES
//     const topCategories = await db
//       .insert(productCategory)
//       .values([
//         { category_name: "Suits", slug: "suits" },
//         { category_name: "Blazers", slug: "blazers" },
//         { category_name: "Shirts", slug: "shirts" },
//         { category_name: "Trousers", slug: "trousers" },
//       ])
//       .returning();

//     const suits = topCategories.find((c) => c.slug === "suits");
//     const blazers = topCategories.find((c) => c.slug === "blazers");

//     if (!suits || !blazers) {
//       throw new Error("Top categories not created properly");
//     }
//     console.log("Top-level categories seeded");
//     // SUB-CATEGORIES

//     const subCategories = await db
//       .insert(productCategory)
//       .values([
//         {
//           category_name: "2-Piece Suits",
//           slug: "2-piece-suits",
//           parent_id: suits!.id,
//         },
//         {
//           category_name: "3-Piece Suits",
//           slug: "3-piece-suits",
//           parent_id: suits!.id,
//         },
//         {
//           category_name: "Slim Fit Blazers",
//           slug: "slim-fit-blazers",
//           parent_id: blazers!.id,
//         },
//       ])
//       .returning();
//     const piece2Suit = subCategories.find((c) => c.slug === "2-piece-suits");
//     const piece3Suit = subCategories.find((c) => c.slug === "3-piece-suits");
//     const slimFitBlazers = subCategories.find(
//       (c) => c.slug === "slim-fit-blazers",
//     );

//     if (!piece2Suit || !piece3Suit || !slimFitBlazers) {
//       throw new Error("Subcategories not created properly");
//     }
//     console.log("✅ Subcategories created");

//     // COLLECTIONS
//     const collections = await db
//       .insert(collection)
//       .values([
//         {
//           name: "Wedding",
//           slug: "wedding",
//           description: "Timeless elegance for your special day",
//           // categoryId: suits.id,
//           image:
//             "https://images.unsplash.com/photo-1765292783311-1797d8b16826?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjB3ZWRkaW5nJTIwc3VpdHN8ZW58MHx8MHx8fDA%3D",
//         },
//         {
//           name: "Evening",
//           slug: "evening",
//           description: "Sophisticated looks for night events",
//           // categoryId: suits.id,
//           image:
//             "https://images.unsplash.com/photo-1615398264198-718da97f988d?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGJsYWNrJTIwZXZlbmluZyUyMHN1aXRzfGVufDB8fDB8fHww",
//         },
//         {
//           name: "Boardroom",
//           slug: "boardroom",
//           description: "Power dressing for leadership moments",
//           // categoryId: suits.id,
//           image:
//             "https://media.istockphoto.com/id/2229590936/photo/successful-male-business-team.webp?a=1&b=1&s=612x612&w=0&k=20&c=ahL275nh0h4p74BHgYqptuX15SCj7djpsmlvxq4Tq0Y=",
//         },
//         {
//           name: "Smart Casual",
//           slug: "smart-casual",
//           description: "Relaxed but refined everyday style",
//           // categoryId: blazers.id,
//           image:
//             "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjBzbWFydCUyMGNhc3VhbHMlMjBzdWl0c3xlbnwwfHwwfHx8MA%3D%3D",
//         },
//       ])
//       .returning();

//     const wedding = collections.find((c) => c.slug === "wedding");
//     const evening = collections.find((c) => c.slug === "evening");
//     const boardroom = collections.find((c) => c.slug === "boardroom");
//     console.log("Collections seeded");

//     // PRODUCTS

//     const products = await db
//       .insert(product)
//       .values([
//         {
//           categoryId: piece3Suit!.id ?? 0,
//           name: "Navy 3-Piece Suit",
//           slug: "navy-3-piece-suit",
//           description: "Classic navy suit for formal occasions",
//           productImage: "/images/navy.jpg",
//           productType: "STANDARD",
//           basePrice: "45000",
//         },
//         {
//           categoryId: piece2Suit!.id ?? 0,
//           name: "Black Tuxedo",
//           slug: "black-tuxedo",
//           description: "Premium black tux for black-tie events",
//           productImage: "/images/tux.jpg",
//           productType: "CUSTOM",
//           basePrice: "60000",
//         },
//         {
//           categoryId: slimFitBlazers!.id ?? 0,
//           name: "Linen Summer Blazer",
//           slug: "linen-blazer",
//           description: "Breathable linen for smart casual wear",
//           productImage: "/images/linen.jpg",
//           productType: "STANDARD",
//           basePrice: "28000",
//         },
//       ] as NewProduct[])
//       .returning();
//     console.log("✅ Products created");

//     const navySuit = products.find((p) => p.slug === "navy-3-piece-suit");
//     const tux = products.find((p) => p.slug === "black-tuxedo");

//     console.log("✅ Products seeded");

//     // 5️⃣ PRODUCT ↔ COLLECTION LINKING

//     await db.insert(productCollection).values([
//       { product_id: navySuit!.id, collection_id: wedding!.id },
//       { product_id: tux!.id, collection_id: wedding!.id },
//       { product_id: tux!.id, collection_id: evening!.id },
//       { product_id: navySuit!.id, collection_id: boardroom!.id },
//     ]);

//     console.log("✅ Product ↔ Collection relationships created");
//     console.log("\n🎉 Seeding completed successfully.");
//     process.exit(0);
//   } catch (err) {
//     console.error("Seeding failed", err);
//     process.exit(1);
//   }
// }
// seed();

import { db, fabric, productCategory, product } from "@repo/db";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed Fabrics (for FK on products)
  const fabrics = await db
    .insert(fabric)
    .values([
      {
        name: "Italian Super 120s Wool",
        sku: "FAB-IT-120S",
        composition: "100% Wool",
        weight: "260g",
        brand: "Vitale Barberis Canonico",
        imageUrl:
          "https://images.unsplash.com/photo-1525517450344-d08c296a71fd?w=1200&q=80&auto=format&fit=crop",
      },
      {
        name: "Irish Linen",
        sku: "FAB-IR-LINEN",
        composition: "100% Linen",
        weight: "230g",
        brand: "Baird McNutt",
        imageUrl:
          "https://images.unsplash.com/photo-1611854779395-1c2b7221e7e5?w=1200&q=80&auto=format&fit=crop",
      },
    ])
    .onConflictDoNothing()
    .returning();

  const italianWool = fabrics[0] ?? { id: 1 };

  // 2. Seed Main Categories (used as collections)
  const mainCategories = await db
    .insert(productCategory)
    .values([
      { name: "Suits", slug: "suits" },
      { name: "Shirts", slug: "shirts" },
    ])
    .returning();

  const suitCategory = mainCategories.find((c) => c.slug === "suits");

  // 3. Seed Sub-Categories
  if (suitCategory) {
    await db.insert(productCategory).values([
      {
        name: "Business Suits",
        slug: "business-suits",
        parentId: suitCategory.id,
      },
      {
        name: "Wedding Suits",
        slug: "wedding-suits",
        parentId: suitCategory.id,
      },
    ]);
  }

  // 4. Seed Products
  if (suitCategory) {
    await db.insert(product).values([
      {
        name: "Classic Navy Business Suit",
        slug: "classic-navy-business-suit",
        description: "A timeless navy two-piece, cut for modern business.",
        mainImage:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80&auto=format&fit=crop",
        basePrice: "695.00",
        categoryId: suitCategory.id,
        fabricId: italianWool.id,
        isActive: true,
      },
      {
        name: "Midnight Peak Lapel Tuxedo",
        slug: "midnight-peak-lapel-tuxedo",
        description: "Black-tie ready with a sharp peak lapel silhouette.",
        mainImage:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80&auto=format&fit=crop",
        basePrice: "899.00",
        categoryId: suitCategory.id,
        fabricId: italianWool.id,
        isActive: true,
      },
      {
        name: "Ivory Wedding Suit",
        slug: "ivory-wedding-suit",
        description: "Soft ivory cloth tailored for the ceremony.",
        mainImage:
          "https://images.unsplash.com/photo-1521572163474-4f4a40f49f57?w=1200&q=80&auto=format&fit=crop",
        basePrice: "849.00",
        categoryId: suitCategory.id,
        fabricId: italianWool.id,
        isActive: true,
      },
    ]);
  }

  console.log("✅ Seeding completed!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
