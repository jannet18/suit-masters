import { Hono } from "hono";
import { customizationOption, db, product } from "@repo/db";
import { eq } from "drizzle-orm";

interface CustomizationItem {
  id: number;
  product_id: number | null;
  group_id: number;
  value: string;
  price_delta: string | null;
  metadata: unknown;
  is_default: boolean | null;
}

interface CustomizationGroup {
  id: number;
  name?: string;
  items?: CustomizationItem[];
}
export const productsHandler = new Hono()
  .get("/", async (c) => {
    const allProducts = await db.select().from(product);
    return c.json(allProducts);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    // 1.Fetch product details
    const productData = await db.query.product.findFirst({
      where: eq(product.id, id),
    });
    if (!productData) {
      return c.json({ error: "Product not found" }, 404);
    }
    // 2. Fetch customization groups/options if it's a CUSTOM product
    let customizationGroups: CustomizationGroup[] = [];
    if (productData.product_type === "CUSTOM") {
      // Assuming customizationOption table has a productId column
      customizationGroups = await db
        .select()
        .from(customizationOption)
        .where(eq(customizationOption.product_id, id));
    }

    return c.json({
      ...productData,
      options: customizationGroups, // This feeds your frontend configuration UI
    });
  });
