// GET /collections
// GET /collections/:slug
// GET /collections/:slug/products
// routes/collections.route.ts
import { Hono, Context } from "hono";
import { asc, collection, db, eq, product, productCollection } from "@repo/db";

export const collectionsHandler = new Hono()
  // .get("/", async (c: Context) => {
  //   try {
  //     const collections = await db
  //       .select()
  //       .from(collection)
  //       .orderBy(asc(collection.name));
  //     return c.json({ success: true, collections });
  //   } catch (error) {
  //     console.error("Error fetching collections:", error);
  //     return c.json({ error: "Failed to fetch collection" }, 500);
  //   }
  // })
  .get("/", async (c: Context) => {
    try {
      const collections = await db.select().from(collection);

      // Map DB fields to frontend grid structure
      const mapped = collections.map((col, index: number) => ({
        title: `The ${col.name}`, // Example: "The Boardroom"
        subtitle: col.name === "Boardroom" ? "Power Suits" : "Collection", // Customize per collection
        description: col.description,
        image:
          col.name === "Boardroom"
            ? "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop"
            : "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80&fit=crop", // fallback
        tag: index === 0 ? "Bestseller" : undefined, // Example first one is tagged
        span:
          index === 0
            ? "lg:col-span-2 lg:row-span-2"
            : "lg:col-span-1 lg:row-span-1",
        slug: col.slug, // Keep slug for navigation
      }));

      return c.json({ success: true, collections: mapped });
    } catch (err) {
      console.error("Error fetching collections:", err);
      return c.json(
        { success: false, error: "Failed to fetch collections" },
        500,
      );
    }
  })
  .get("/:slug/products", async (c: Context) => {
    const slug = c.req.param("slug");
    try {
      // Find collection by slug
      const col = await db
        .select()
        .from(collection)
        .where(eq(collection.slug, slug))
        .limit(1)
        .then((r) => r[0]);
      if (!col) return c.json({ error: "Collection not found" }, 404);
      const productsInCollection = await db
        .select()
        .from(product)
        .innerJoin(
          productCollection,
          eq(product.id, productCollection.product_id),
        )
        .where(eq(productCollection.collection_id, col.id))
        .orderBy(asc(product.name));

      return c.json({
        success: true,
        collection: col,
        products: productsInCollection,
      });
    } catch (error) {
      console.error("Error fetching products for collection:", error);
      return c.json({ error: "Failed to fetch products for collection" });
    }
  });
