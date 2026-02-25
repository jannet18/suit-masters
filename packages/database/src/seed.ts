import { db } from "./db.js";
import { product, productCategory } from "./schema/products.js";

async function seed() {
  console.log("🌱 Seeding products...");

  const weddingResult = await db
    .insert(productCategory)
    .values({ category_name: "wedding" })
    .returning();

  if (!weddingResult[0]) {
    throw new Error("Failed to create wedding category");
  }
  const wedding = weddingResult[0];

  const corporateResult = await db
    .insert(productCategory)
    .values({ category_name: "corporate" })
    .returning();

  if (!corporateResult[0]) {
    throw new Error("Failed to create corporate category");
  }
  const corporate = corporateResult[0];

  await db.insert(product).values([
    {
      name: "Navy Wedding Suit",
      description: "Elegant navy suit for weddings",
      category_id: wedding.id,
      product_image:
        "https://plus.unsplash.com/premium_photo-1696942353102-0a5def645595",
      product_type: "STANDARD",
      base_price: "18000",
    },
    {
      name: "Charcoal Corporate Suit",
      description: "Sharp charcoal suit for business",
      category_id: corporate.id,
      product_image:
        "https://media.istockphoto.com/id/2236494619/photo/businessman-posing-confidently-with-tablet-in-office.jpg",
      product_type: "STANDARD",
      base_price: "22000",
    },
    {
      name: "Bespoke Custom Suit",
      description: "Fully customizable bespoke suit",
      category_id: wedding.id,
      product_image:
        "https://lugo.co.ke/35-large_default/pinstripe-black-suit-in-nairobi.jpg",
      product_type: "CUSTOM",
      base_price: "35000",
    },
  ]);

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
