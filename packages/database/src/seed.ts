// import { db } from "./db.js";
// import { product, productCategory } from "./schema/products.js";

// async function seed() {
//   console.log("🌱 Seeding products...");

//   const weddingResult = await db
//     .insert(productCategory)
//     .values({ category_name: "wedding" })
//     .returning();

//   if (!weddingResult[0]) {
//     throw new Error("Failed to create wedding category");
//   }
//   const wedding = weddingResult[0];

//   const corporateResult = await db
//     .insert(productCategory)
//     .values({ category_name: "corporate" })
//     .returning();

//   if (!corporateResult[0]) {
//     throw new Error("Failed to create corporate category");
//   }
//   const corporate = corporateResult[0];

//   await db.insert(product).values([
//     {
//       name: "Navy Wedding Suit",
//       description: "Elegant navy suit for weddings",
//       category_id: wedding.id,
//       product_image:
//         "https://plus.unsplash.com/premium_photo-1696942353102-0a5def645595",
//       product_type: "STANDARD",
//       base_price: "18000",
//     },
//     {
//       name: "Charcoal Corporate Suit",
//       description: "Sharp charcoal suit for business",
//       category_id: corporate.id,
//       product_image:
//         "https://media.istockphoto.com/id/2236494619/photo/businessman-posing-confidently-with-tablet-in-office.jpg",
//       product_type: "STANDARD",
//       base_price: "22000",
//     },
//     {
//       name: "Bespoke Custom Suit",
//       description: "Fully customizable bespoke suit",
//       category_id: wedding.id,
//       product_image:
//         "https://lugo.co.ke/35-large_default/pinstripe-black-suit-in-nairobi.jpg",
//       product_type: "CUSTOM",
//       base_price: "35000",
//     },
//   ]);

//   console.log("✅ Seed complete");
//   process.exit(0);
// }

// seed().catch((err) => {
//   console.error("❌ Seed failed", err);
//   process.exit(1);
// });

import { db } from "./db.js";
import { product, productCategory, productCollection } from "./schema/index.js";
import { collection } from "./schema/index.js";

async function seed() {
  // TOP CATEGORIES
  const topCategories = await db
    .insert(productCategory)
    .values([
      { category_name: "Suits", slug: "suits" },
      { category_name: "Blazers", slug: "blazers" },
      { category_name: "Shirts", slug: "shirts" },
      { category_name: "Trousers", slug: "trousers" },
    ])
    .returning();

  const suits = topCategories.find((c) => c.slug === "suits");
  const blazers = topCategories.find((c) => c.slug === "blazers");

  if (!suits || !blazers) {
    throw new Error("Top categories not created properly");
  }
  console.log("Top-level categories seeded");
  // SUB-CATEGORIES

  const subCategories = await db
    .insert(productCategory)
    .values([
      {
        category_name: "2-Piece Suits",
        slug: "2-piece-suits",
        parent_id: suits!.id,
      },
      {
        category_name: "3-Piece Suits",
        slug: "3-piece-suits",
        parent_id: suits!.id,
      },
      {
        category_name: "Slim Fit Blazers",
        slug: "slim-fit-blazers",
        parent_id: blazers!.id,
      },
    ])
    .returning();
  const piece2Suit = subCategories.find((c) => c.slug === "2-piece-suits");
  const piece3Suit = subCategories.find((c) => c.slug === "3-piece-suits");
  const slimFitBlazers = subCategories.find(
    (c) => c.slug === "slim-fit-blazers",
  );

  if (!piece2Suit || !piece3Suit || !slimFitBlazers) {
    throw new Error("Subcategories not created properly");
  }
  console.log("✅ Subcategories created");

  // COLLECTIONS
  const collections = await db
    .insert(collection)
    .values([
      {
        name: "Wedding",
        slug: "wedding",
        description: "Timeless elegance for your special day",
      },
      {
        name: "Evening",
        slug: "evening",
        description: "Sophisticated looks for night events",
      },
      {
        name: "Boardroom",
        slug: "boardroom",
        description: "Power dressing for leadership moments",
      },
      {
        name: "Smart Casual",
        slug: "smart-casual",
        description: "Relaxed but refined everyday style",
      },
    ])
    .returning();

  const wedding = collections.find((c) => c.slug === "wedding");
  const evening = collections.find((c) => c.slug === "evening");
  const boardroom = collections.find((c) => c.slug === "boardroom");
  console.log("Collections seeded");

  // PRODUCTS

  const products = await db
    .insert(product)
    .values([
      {
        category_id: piece3Suit!.id,
        name: "Navy 3-Piece Suit",
        slug: "navy-3-piece-suit",
        description: "Classic navy suit for formal occasions",
        product_image: "/images/navy.jpg",
        product_type: "STANDARD",
        base_price: "45000",
      },
      {
        category_id: piece2Suit!.id,
        name: "Black Tuxedo",
        slug: "black-tuxedo",
        description: "Premium black tux for black-tie events",
        product_image: "/images/tux.jpg",
        product_type: "CUSTOM",
        base_price: "60000",
      },
      {
        category_id: slimFitBlazers!.id,
        name: "Linen Summer Blazer",
        slug: "linen-blazer",
        description: "Breathable linen for smart casual wear",
        product_image: "/images/linen.jpg",
        product_type: "STANDARD",
        base_price: "28000",
      },
    ])
    .returning();
  console.log("✅ Products created");

  const navySuit = products.find((p) => p.slug === "navy-3-piece-suit");
  const tux = products.find((p) => p.slug === "black-tuxedo");

  console.log("✅ Products seeded");

  // 5️⃣ PRODUCT ↔ COLLECTION LINKING

  await db.insert(productCollection).values([
    { product_id: navySuit!.id, collection_id: wedding!.id },
    { product_id: tux!.id, collection_id: wedding!.id },
    { product_id: tux!.id, collection_id: evening!.id },
    { product_id: navySuit!.id, collection_id: boardroom!.id },
  ]);

  console.log("✅ Product ↔ Collection relationships created");
  console.log("\n🎉 Seeding completed successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
