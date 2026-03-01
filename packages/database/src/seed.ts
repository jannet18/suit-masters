import { db } from "./db.js";
import { product, productCategory, productCollection } from "./schema/index.js";
import { collection } from "./schema/index.js";

async function seed() {
  try {
    console.log("🧹 Clearing existing data...");

    // Delete in dependency order to avoid FK issues
    await db.delete(productCollection).execute();
    await db.delete(product).execute();
    await db.delete(collection).execute();
    await db.delete(productCategory).execute();

    console.log("✅ Tables cleared");
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
          category_id: suits.id,
          image:
            "https://images.unsplash.com/photo-1765292783311-1797d8b16826?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjB3ZWRkaW5nJTIwc3VpdHN8ZW58MHx8MHx8fDA%3D",
        },
        {
          name: "Evening",
          slug: "evening",
          description: "Sophisticated looks for night events",
          category_id: suits.id,
          image:
            "https://images.unsplash.com/photo-1615398264198-718da97f988d?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGJsYWNrJTIwZXZlbmluZyUyMHN1aXRzfGVufDB8fDB8fHww",
        },
        {
          name: "Boardroom",
          slug: "boardroom",
          description: "Power dressing for leadership moments",
          category_id: suits.id,
          image:
            "https://media.istockphoto.com/id/2229590936/photo/successful-male-business-team.webp?a=1&b=1&s=612x612&w=0&k=20&c=ahL275nh0h4p74BHgYqptuX15SCj7djpsmlvxq4Tq0Y=",
        },
        {
          name: "Smart Casual",
          slug: "smart-casual",
          description: "Relaxed but refined everyday style",
          category_id: blazers.id,
          image:
            "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjBzbWFydCUyMGNhc3VhbHMlMjBzdWl0c3xlbnwwfHwwfHx8MA%3D%3D",
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
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
}
seed();
