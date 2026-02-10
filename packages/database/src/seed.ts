import {
  customizationGroup,
  customizationOption,
  db,
  product,
  productCategory,
  productItem,
} from "./index";
// import {
//   productCategory,
//   product,
//   productItem,
//   customizationGroup,
//   customizationOption,
// } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Category
  const [suitsCategory] = await db
    .insert(productCategory)
    .values({
      category_name: "Suits",
    })
    .returning();

  // 2. Product (customizable suit)
  const [navySuit] = await db
    .insert(product)
    .values({
      category_id: suitsCategory.id,
      name: "Classic Navy Suit",
      description: "Custom tailored navy suit",
      product_image: "/images/navy-suit.jpg",
      product_type: "CUSTOM",
      base_price: "35000",
    })
    .returning();

  // 3. Product item (base SKU)
  const [navySuitItem] = await db
    .insert(productItem)
    .values({
      product_id: navySuit.id,
      sku: "NAVY-SUIT-BASE",
      stock: 999,
      price: "35000",
    })
    .returning();

  // 4. Customization groups
  const [fabricGroup] = await db
    .insert(customizationGroup)
    .values({
      product_id: navySuit.id,
      name: "Fabric",
      required: true,
      display_order: 1,
    })
    .returning();

  const [fitGroup] = await db
    .insert(customizationGroup)
    .values({
      product_id: navySuit.id,
      name: "Fit",
      required: true,
      display_order: 2,
    })
    .returning();

  // 5. Customization options
  await db.insert(customizationOption).values([
    {
      group_id: fabricGroup.id,
      value: "Italian Wool",
      price_delta: "5000",
      is_default: true,
    },
    {
      group_id: fabricGroup.id,
      value: "British Wool",
      price_delta: "7000",
    },
    {
      group_id: fitGroup.id,
      value: "Slim Fit",
      price_delta: "0",
      is_default: true,
    },
    {
      group_id: fitGroup.id,
      value: "Regular Fit",
      price_delta: "0",
    },
  ]);

  console.log("✅ Seed completed");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
