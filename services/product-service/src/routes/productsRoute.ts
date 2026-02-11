import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "@repo/db";
import { customizationOption, product } from "@repo/db/src/schema/products";

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
    if (Number.isNaN(id)) {
      return c.json({ error: "Invalid product ID" }, 400);
    }
    // 1.Fetch product details
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, id))
      .limit(1)
      .then((res) => res[0]);
    if (!productData) {
      return c.json({ error: "Product not found" }, 404);
    }
    // 2. Fetch customization groups/options if it's a CUSTOM product
    let customizationGroups: CustomizationGroup[] = [];
    if (productData.product_type === "CUSTOM") {
      customizationGroups = await db
        .select()
        .from(customizationOption)
        .where(eq(customizationOption.product_id, id));
    }

    return c.json({
      ...productData,
      options: customizationGroups,
    });
  });
