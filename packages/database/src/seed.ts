import {
  db,
  fabric,
  productCategory,
  product,
  measurementDefinitions,
  collection,
  productCollection,
} from "@repo/db";

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
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=60",
      },
      {
        name: "Irish Linen",
        sku: "FAB-IR-LINEN",
        composition: "100% Linen",
        weight: "230g",
        brand: "Baird McNutt",
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=60",
      },
      {
        name: "Velvet Wool",
        sku: "FAB-VW-WOOL",
        composition: "100% Wool",
        weight: "230g",
        brand: "Baird McNutt",
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=60",
      },
      {
        name: "Tweed Fabric",
        sku: "FAB-TF-FABRIC",
        composition: "100% Wool",
        weight: "240g",
        brand: "Baird McNutt",
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=60",
      },
    ])
    .onConflictDoNothing()
    .returning();

  const italianWool = fabrics[0] ?? { id: 1 };

  // 2. Seed Main Categories
  const mainCategories = await db
    .insert(productCategory)
    .values([
      { name: "Suits", slug: "suits" },
      { name: "Shirts", slug: "shirts" },
      { name: "Blazers", slug: "blazers" },
      { name: "Pants", slug: "pants" },
    ])
    .onConflictDoNothing()
    .returning();

  const suitCategory = mainCategories.find((c) => c.slug === "suits");
  const blazersCategory = mainCategories.find((c) => c.slug === "blazers");
  const pantsCategory = mainCategories.find((c) => c.slug === "pants");
  const shirtsCategory = mainCategories.find((c) => c.slug === "shirts");
  // 3. Seed Sub-Categories
  if (suitCategory) {
    await db
      .insert(productCategory)
      .values([
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
        {
          name: "Boardroom Suits",
          slug: "boardroom-suits",
          parentId: suitCategory.id,
        },
        {
          name: "Casual Suits",
          slug: "casual-suits",
          parentId: suitCategory.id,
        },
      ])
      .onConflictDoNothing();
  }
  if (blazersCategory) {
    await db
      .insert(productCategory)
      .values([
        {
          name: "Single-Breasted",
          slug: "single-breasted",
          parentId: blazersCategory.id,
        },
        {
          name: "Double-Breasted",
          slug: "wedding-suits",
          parentId: blazersCategory.id,
        },
        {
          name: "Tweed",
          slug: "tweed",
          parentId: blazersCategory.id,
        },
        {
          name: "Velvet",
          slug: "velvet",
          parentId: blazersCategory.id,
        },
        {
          name: "Linen/Cotton",
          slug: "linen-cotton",
          parentId: blazersCategory.id,
        },
      ])
      .onConflictDoNothing();
  }
  if (shirtsCategory) {
    await db
      .insert(productCategory)
      .values([
        {
          name: "Dress Shirt",
          slug: "dress-shirt",
          parentId: shirtsCategory.id,
        },
        {
          name: "Double Cuff Shirt",
          slug: "double-cuff-shirt",
          parentId: shirtsCategory.id,
        },
        {
          name: "Mandarin/Band Collar Shirt",
          slug: "mandarin/band-collar-shirt",
          parentId: shirtsCategory.id,
        },
        {
          name: "Non-Iron Shirt",
          slug: "non-iron-shirt",
          parentId: shirtsCategory.id,
        },
        {
          name: "Linen Shirt",
          slug: "linen-shirt",
          parentId: shirtsCategory.id,
        },
      ])
      .onConflictDoNothing();
  }

  if (pantsCategory) {
    await db
      .insert(productCategory)
      .values([
        {
          name: "Chinos",
          slug: "chinos",
          parentId: pantsCategory.id,
        },
        {
          name: "Corduroy Pants",
          slug: "corduroy-pants",
          parentId: pantsCategory.id,
        },
        {
          name: "Slacks",
          slug: "slacks",
          parentId: pantsCategory.id,
        },
        {
          name: "Pleated",
          slug: "pleated",
          parentId: pantsCategory.id,
        },
        {
          name: "Linen Pants",
          slug: "linen-pants",
          parentId: pantsCategory.id,
        },
      ])
      .onConflictDoNothing();
  }
  // 4. Seed Products
  let productIds: number[] = [];

  // Fetch category IDs for different product types
  const businessSuitsCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "business-suits"),
  });

  const weddingSuitsCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "wedding-suits"),
  });

  const boardroomSuitsCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "boardroom-suits"),
  });

  const casualSuitsCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "casual-suits"),
  });

  const singleBreastedCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "single-breasted"),
  });

  const doubleBreastedCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "double-breasted"),
  });

  const dressShirtCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "dress-shirt"),
  });

  const chinosCategory = await db.query.productCategory.findFirst({
    where: (cat, { eq }) => eq(cat.slug, "chinos"),
  });

  // Try to insert products for different categories
  try {
    await db
      .insert(product)
      .values([
        // Suits - Business Collection
        {
          name: "Classic Navy Business Suit",
          slug: "classic-navy-business-suit",
          description: "A timeless navy two-piece, cut for modern business.",
          mainImage:
            "https://media.istockphoto.com/id/1352080196/photo/portrait-of-friendly-mature-businessman.webp?a=1&b=1&s=612x612&w=0&k=20&c=Q0IU3lRhZqe7Cx-JxjKoKsQ548QwKd0wJrdqGBrqsq4=",
          basePrice: "695.00",
          categoryId: businessSuitsCategory?.id || 1,
          fabricId: 1,
          isActive: true,
        },
        // Suits - Wedding Collection
        {
          name: "Ivory Wedding Suit",
          slug: "ivory-wedding-suit",
          description: "Soft ivory cloth tailored for the ceremony.",
          mainImage:
            "https://media.istockphoto.com/id/1467795177/photo/groom-in-white-suit-with-dried-flower-boutonniere.webp?a=1&b=1&s=612x612&w=0&k=20&c=ZLLiNLhSITR5K8VKW05YOM-Pflq-LIZyuEQYiA3Pl2U=",
          basePrice: "849.00",
          categoryId: weddingSuitsCategory?.id || 1,
          fabricId: 1,
          isActive: true,
        },
        // Suits - Evening Collection
        {
          name: "Midnight Peak Lapel Tuxedo",
          slug: "midnight-peak-lapel-tuxedo",
          description: "Black-tie ready with a sharp peak lapel silhouette.",
          mainImage:
            "https://images.unsplash.com/photo-1592878897400-43fb1f1cc324?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmFtZSUzQSUyMCUyMk1pZG5pZ2h0JTIwUGVhayUyMExhcGVsJTIwVHV4ZWRvJTIyJTJDfGVufDB8fDB8fHww",
          basePrice: "899.00",
          categoryId: weddingSuitsCategory?.id || 1,
          fabricId: 1,
          isActive: true,
        },
        // Suits - Boardroom Collection
        {
          name: "Charcoal Boardroom Suit",
          slug: "charcoal-boardroom-suit",
          description: "Powerful charcoal suit for executive meetings.",
          mainImage:
            "https://images.unsplash.com/photo-1594938374181-4b7d72c4370c?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Qk9BUkRST09NJTIwU3VpdHxlbnwwfHwwfHx8MA%3D%3D",
          basePrice: "725.00",
          categoryId: boardroomSuitsCategory?.id || 1,
          fabricId: 1,
          isActive: true,
        },
        // Suits - Casual Collection
        {
          name: "Linen Casual Suit",
          slug: "linen-casual-suit",
          description: "Breathable linen suit for smart casual occasions.",
          mainImage:
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q0FTVUFMJTIwU3VpdHxlbnwwfHwwfHx8MA%3D%3D",
          basePrice: "550.00",
          categoryId: casualSuitsCategory?.id || 1,
          fabricId: 1,
          isActive: true,
        },
        // Blazers - Single Breasted
        {
          name: "Navy Single-Breasted Blazer",
          slug: "navy-single-breasted-blazer",
          description: "Versatile navy blazer for any occasion.",
          mainImage:
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QkxBWkVSU3xlbnwwfHwwfHx8MA%3D%3D",
          basePrice: "425.00",
          categoryId: singleBreastedCategory?.id || 2,
          fabricId: 1,
          isActive: true,
        },
        // Blazers - Double Breasted
        {
          name: "Double-Breasted Tweed Blazer",
          slug: "double-breasted-tweed-blazer",
          description: "Classic tweed blazer with double-breasted design.",
          mainImage:
            "https://images.unsplash.com/photo-1592878897400-43fb1f1cc324?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RE9VQkxFJTIwQlJFQVNURUQlMjBCbGF6ZXJ8ZW58MHx8MHx8fDA%3D",
          basePrice: "475.00",
          categoryId: doubleBreastedCategory?.id || 2,
          fabricId: 1,
          isActive: true,
        },
        // Shirts - Dress Shirt
        {
          name: "White Dress Shirt",
          slug: "white-dress-shirt",
          description: "Crisp white dress shirt for formal occasions.",
          mainImage:
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U0hJUlRTfGVufDB8fDB8fHww",
          basePrice: "125.00",
          categoryId: dressShirtCategory?.id || 3,
          fabricId: 1,
          isActive: true,
        },
        // Pants - Chinos
        {
          name: "Beige Chinos",
          slug: "beige-chinos",
          description: "Comfortable beige chinos for casual wear.",
          mainImage:
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q0hJTk9TfGVufDB8fDB8fHww",
          basePrice: "95.00",
          categoryId: chinosCategory?.id || 4,
          fabricId: 1,
          isActive: true,
        },
        // Additional product for more variety
        {
          name: "Black Formal Trousers",
          slug: "black-formal-trousers",
          description: "Slim-fit black trousers for formal occasions.",
          mainImage:
            "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VFJPVVNFUlN8ZW58MHx8MHx8fDA%3D",
          basePrice: "110.00",
          categoryId: chinosCategory?.id || 4,
          fabricId: 1,
          isActive: true,
        },
      ])
      .onConflictDoNothing();
  } catch (error) {
    console.log("Products may already exist, continuing...", error);
  }

  // Fetch all products to get their IDs
  const products = await db
    .select({ id: product.id })
    .from(product)
    .orderBy(product.id)
    .limit(12);

  productIds = products.map((p) => p.id);
  console.log(`Fetched product IDs: ${JSON.stringify(productIds)}`);

  // 5. Seed Collections (Indochino/Hockerty style)
  console.log("🎨 Seeding collections...");
  // Try to insert collections
  await db
    .insert(collection)
    .values([
      {
        name: "Wedding",
        slug: "wedding",
        description: "Timeless elegance for your special day",
        image:
          "https://images.unsplash.com/photo-1529635229076-82fefed713c4?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8V2VkZGluZyUyMFN1aXR8ZW58MHx8MHx8fDA%3D",
      },
      {
        name: "Evening",
        slug: "evening",
        description: "Sophisticated looks for night events",
        image:
          "https://images.unsplash.com/photo-1552571933-a7cf95629dc7?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8RVZFTklORyUyMFN1aXR8ZW58MHx8MHx8fDA%3D",
      },
      {
        name: "Boardroom",
        slug: "boardroom",
        description: "Power dressing for leadership moments",
        image:
          "https://plus.unsplash.com/premium_photo-1770382893394-c0dffb212ac2?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Qk9BUkRST09NJTIwTUVOJTIwU3VpdHxlbnwwfHwwfHx8MA%3D%3D",
      },
      {
        name: "Casual",
        slug: "casual",
        description: "Relaxed but refined everyday style",
        image:
          "https://images.unsplash.com/photo-1724414595063-09eb0e742541?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RVZFTklORyUyMFN1aXR8ZW58MHx8MHx8fDA%3D",
      },
      {
        name: "Business",
        slug: "business",
        description: "Professional attire for corporate settings",
        image:
          "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QlVTSU5FU1MlMjBTdWl0fGVufDB8fDB8fHww",
      },
    ])
    .onConflictDoNothing();

  // Fetch all collections (including existing ones)
  const collections = await db
    .select({ id: collection.id, slug: collection.slug })
    .from(collection);

  // 6. Link products to collections (many-to-many)
  console.log(`Debug: productIds = ${JSON.stringify(productIds)}`);
  console.log(
    `Debug: collections = ${JSON.stringify(collections.map((c) => ({ id: c.id, slug: c.slug })))}`,
  );

  if (productIds.length >= 10 && collections.length >= 5) {
    try {
      // Map collection slugs to indices for readability
      const collectionMap: Record<string, number> = {};
      collections.forEach((c, index) => {
        collectionMap[c.slug] = index;
      });

      await db
        .insert(productCollection)
        .values([
          // Product 0: Classic Navy Business Suit (suits/business)
          {
            product_id: productIds[0]!,
            collection_id: collections[collectionMap["business"]!]!.id,
          }, // Business
          {
            product_id: productIds[0]!,
            collection_id: collections[collectionMap["boardroom"]!]!.id,
          }, // Boardroom

          // Product 1: Ivory Wedding Suit (suits/wedding)
          {
            product_id: productIds[1]!,
            collection_id: collections[collectionMap["wedding"]!]!.id,
          }, // Wedding
          {
            product_id: productIds[1]!,
            collection_id: collections[collectionMap["evening"]!]!.id,
          }, // Evening

          // Product 2: Midnight Peak Lapel Tuxedo (suits/evening)
          {
            product_id: productIds[2]!,
            collection_id: collections[collectionMap["evening"]!]!.id,
          }, // Evening
          {
            product_id: productIds[2]!,
            collection_id: collections[collectionMap["wedding"]!]!.id,
          }, // Wedding

          // Product 3: Charcoal Boardroom Suit (suits/boardroom)
          {
            product_id: productIds[3]!,
            collection_id: collections[collectionMap["boardroom"]!]!.id,
          }, // Boardroom
          {
            product_id: productIds[3]!,
            collection_id: collections[collectionMap["business"]!]!.id,
          }, // Business

          // Product 4: Linen Casual Suit (suits/casual)
          {
            product_id: productIds[4]!,
            collection_id: collections[collectionMap["casual"]!]!.id,
          }, // Casual
          {
            product_id: productIds[4]!,
            collection_id: collections[collectionMap["business"]!]!.id,
          }, // Business

          // Product 5: Navy Single-Breasted Blazer (blazers)
          {
            product_id: productIds[5]!,
            collection_id: collections[collectionMap["business"]!]!.id,
          }, // Business
          {
            product_id: productIds[5]!,
            collection_id: collections[collectionMap["casual"]!]!.id,
          }, // Casual

          // Product 6: Double-Breasted Tweed Blazer (blazers)
          {
            product_id: productIds[6]!,
            collection_id: collections[collectionMap["boardroom"]!]!.id,
          }, // Boardroom
          {
            product_id: productIds[6]!,
            collection_id: collections[collectionMap["evening"]!]!.id,
          }, // Evening

          // Product 7: White Dress Shirt (shirts)
          {
            product_id: productIds[7]!,
            collection_id: collections[collectionMap["business"]!]!.id,
          }, // Business
          {
            product_id: productIds[7]!,
            collection_id: collections[collectionMap["wedding"]!]!.id,
          }, // Wedding

          // Product 8: Beige Chinos (pants)
          {
            product_id: productIds[8]!,
            collection_id: collections[collectionMap["casual"]!]!.id,
          }, // Casual
          {
            product_id: productIds[8]!,
            collection_id: collections[collectionMap["business"]!]!.id,
          }, // Business

          // Product 9: Black Formal Trousers (pants)
          {
            product_id: productIds[9]!,
            collection_id: collections[collectionMap["business"]!]!.id,
          }, // Business
          {
            product_id: productIds[9]!,
            collection_id: collections[collectionMap["evening"]!]!.id,
          }, // Evening
        ])
        .onConflictDoNothing();
      console.log(
        "✅ Product ↔ Collection relationships created for all collections",
      );
    } catch (error) {
      console.error(
        "❌ Failed to create product-collection relationships:",
        error,
      );
    }
  } else {
    console.warn(
      `⚠️  Skipping product-collection linking: productIds=${productIds.length}, collections=${collections.length}`,
    );
  }

  // 7. Seed Measurement Definitions (Indochino-style video guides)
  console.log("📏 Seeding measurement definitions...");
  await db
    .insert(measurementDefinitions)
    .values([
      {
        bodyPart: "height",
        displayName: "Height",
        description:
          "Stand straight with your back against a wall. Measure from the floor to the top of your head. Keep your heels together and look straight ahead.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-height-against-a-wall-41506-large.mp4",
        displayOrder: 1,
      },
      {
        bodyPart: "chest",
        displayName: "Chest",
        description:
          "Measure around the fullest part of your chest. Keep the tape measure parallel to the floor and don't pull too tight. Breathe normally.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-chest-circumference-41508-large.mp4",
        displayOrder: 2,
      },
      {
        bodyPart: "waist",
        displayName: "Waist",
        description:
          "Find your natural waistline (usually just above the belly button). Measure around this point without sucking in your stomach.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-waist-circumference-41509-large.mp4",
        displayOrder: 3,
      },
      {
        bodyPart: "hips",
        displayName: "Seat/Hips",
        description:
          "Measure around the fullest part of your hips and seat. Stand with your feet together and ensure the tape is level all around.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-hip-circumference-41510-large.mp4",
        displayOrder: 4,
      },
      {
        bodyPart: "shoulder",
        displayName: "Shoulder Width",
        description:
          "Measure from the edge of one shoulder to the other across your back. Keep your arms relaxed at your sides.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-shoulder-width-41511-large.mp4",
        displayOrder: 5,
      },
      {
        bodyPart: "inseam",
        displayName: "Inseam",
        description:
          "Measure from your crotch down to your ankle bone along the inner leg. Stand with your legs slightly apart for accuracy.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-inseam-length-41512-large.mp4",
        displayOrder: 6,
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Seeding completed!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
