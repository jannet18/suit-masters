// GET /products
// GET /products/:slug
// GET /products?category=
// GET /products?collection=

import { Context, Hono } from "hono";
import { asc, eq } from "@repo/db";
import { customizationOption, db, product } from "@repo/db";

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
  .get("/", async (c: Context) => {
    try {
      const allProducts = await db
        .select()
        .from(product)
        .orderBy(asc(product.createdAt))
        .limit(20);

      const latestProducts = await db
        .select()
        .from(product)
        .where(eq(product.product_type, "STANDARD"))
        .orderBy(asc(product.createdAt))
        .limit(20);
      return c.json({ all: allProducts, latest: latestProducts });
    } catch (error) {
      console.error("Error fetching products:", error);
      return c.json({ error: "Failed to fetch products" }, 500);
    }
  })
  .get("/:id", async (c: Context) => {
    const id = Number(c.req.param("id"));
    if (Number.isNaN(id)) {
      return c.json({ error: "Invalid product ID" }, 400);
    }
    try {
      // 1.Fetch product details
      const productData = await db
        .select()
        .from(product)
        .where(eq(product.id, id))
        .limit(1)
        .then((res: any) => res[0]);
      if (!productData) {
        return c.json({ error: "Product not found" }, 404);
      }
      // 2. Fetch customization groups/options if it's a CUSTOM product
      let customizationGroups: CustomizationGroup[] = [];
      if (productData.product_type === "CUSTOM") {
        const options = await db
          .select()
          .from(customizationOption)
          .where(eq(customizationOption.product_id, id));

        // Group options by group_id
        const groupMap = new Map<number, CustomizationGroup>();
        options.forEach((option: any) => {
          if (!groupMap.has(option.group_id)) {
            groupMap.set(option.group_id, {
              id: option.group_id,
              name: "", // You can fetch group name if needed
              items: [],
            });
          }
          groupMap.get(option.group_id)?.items?.push(option);
        });

        // Convert map to array
        customizationGroups = Array.from(groupMap.values());
      }

      return c.json({
        ...productData,
        options: customizationGroups,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      return c.json({ error: "Failed to fetch product details" }, 500);
    }
  });

// Example of a product details response structure
/*
{
  "id": 1,
  "name": "The Executive Italian Suit",
  "description": "A luxurious suit made from the finest Italian wool.",
  "image_url": "https://example.com/images/italian-suit.jpg",
  "product_type": "CUSTOM",
  "base_price": "799.00",
  "options": [
    {
      "id": 1,
      "name": "Lapel Style",
      "items": [
        {
          "id": 1,
          "group_id": 1,
          "value": "Notch Lapel",
          "price_delta": "0",
          "is_default": true
        },
        {
          "id": 2,
          "group_id": 1,
          "value": "Peak Lapel",
          "price_delta": "50.00",
          "is_default": false
        },
        {
          "id": 3,
          "group_id": 1,
          "value": "Shawl Lapel",
          "price_delta": "75.00",
          "is_default": false
        }
      ]
    },
    {
      "id": 2,
      "name": "Fabric",
      "items": [
        {
          "id": 4,
          "group_id": 2,
          "value": "Italian Wool",
          "price_delta": "0",
          "is_default": true
        },
        {
          "id": 5,
          "group_id": 2,
          "value": "British Wool",
          "price_delta": "100.00",
          "is_default": false
        }
      ]
    }
  ]
}
*/
