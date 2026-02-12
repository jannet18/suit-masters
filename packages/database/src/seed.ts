// import { db } from ".";
// import {
//   customizationGroup,
//   customizationOption,
//   product,
//   productCategory,
//   productItem,
// } from "./schema/products";

// async function seed() {
//   console.log("🌱 Seeding database...");

//   // 1. Category
//   const [suitsCategory] = await db
//     .insert(productCategory)
//     .values({
//       category_name: "Suits",
//     })
//     .returning();

//   // 2. Product (customizable suit)
//   const [navySuit] = await db
//     .insert(product)
//     .values({
//       category_id: suitsCategory.id,
//       name: "Classic Navy Suit",
//       description: "Custom tailored navy suit",
//       product_image: "/images/navy-suit.jpg",
//       product_type: "CUSTOM",
//       base_price: "35000",
//     })
//     .returning();

//   // 3. Product item (base SKU)
//   const [navySuitItem] = await db
//     .insert(productItem)
//     .values({
//       product_id: navySuit.id,
//       sku: "NAVY-SUIT-BASE",
//       stock: 999,
//       price: "35000",
//     })
//     .returning();

//   // 4. Customization groups
//   const [fabricGroup] = await db
//     .insert(customizationGroup)
//     .values({
//       product_id: navySuit.id,
//       name: "Fabric",
//       required: true,
//       display_order: 1,
//     })
//     .returning();

//   const [fitGroup] = await db
//     .insert(customizationGroup)
//     .values({
//       product_id: navySuit.id,
//       name: "Fit",
//       required: true,
//       display_order: 2,
//     })
//     .returning();

//   // 5. Customization options
//   await db.insert(customizationOption).values([
//     {
//       group_id: fabricGroup.id,
//       value: "Italian Wool",
//       price_delta: "5000",
//       is_default: true,
//     },
//     {
//       group_id: fabricGroup.id,
//       value: "British Wool",
//       price_delta: "7000",
//     },
//     {
//       group_id: fitGroup.id,
//       value: "Slim Fit",
//       price_delta: "0",
//       is_default: true,
//     },
//     {
//       group_id: fitGroup.id,
//       value: "Regular Fit",
//       price_delta: "0",
//     },
//   ]);

//   console.log("✅ Seed completed");
//   process.exit(0);
// }

// seed().catch((err) => {
//   console.error("❌ Seed failed", err);
//   process.exit(1);
// });

import { db } from "./index";
import { product, productCategory } from "./schema/products";

async function seed() {
  console.log("🌱 Seeding products...");

  // 1. Create categories
  const [wedding] = await db
    .insert(productCategory)
    .values({ category_name: "wedding" })
    .returning();

  const [corporate] = await db
    .insert(productCategory)
    .values({ category_name: "corporate" })
    .returning();

  // 2. Create products
  await db.insert(product).values([
    {
      name: "Navy Wedding Suit",
      description: "Elegant navy suit for weddings",
      category_id: wedding.id,
      product_image:
        "https://plus.unsplash.com/premium_photo-1696942353102-0a5def645595?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmxhY2slMjBtYW4lMjBpbiUyMHN1aXR8ZW58MHx8MHx8fDA%3D",
      product_type: "STANDARD",
      base_price: "18000",
    },
    {
      name: "Charcoal Corporate Suit",
      description: "Sharp charcoal suit for business",
      category_id: corporate.id,
      product_image:
        "https://media.istockphoto.com/id/2236494619/photo/businessman-posing-confidently-with-tablet-in-office.jpg?s=612x612&w=0&k=20&c=NAjgJdoAXx3KwyH8yER3yIgDRh5TupVmBlvIqRTwNbM=",
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
  console.error(err);
  process.exit(1);
});
