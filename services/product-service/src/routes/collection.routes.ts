import { asc, collection, db, eq } from "@repo/db";
import { Context, Hono } from "hono";

export const collectionsHandler = new Hono()
  // GET /api/collections
  // Used for the Bento/Grid landing page
  .get("/", async (c: Context) => {
    const data = await db.query.collection.findMany({
      orderBy: [asc(collection.name)],
    });

    const collections = data.map((col, i) => ({
      title: col.name,
      slug: col.slug,
      image: col.image,
      description: col.description,
      // Logic for bento spans
      span: i === 0 ? "wide" : "standard",
    }));

    return c.json({ success: true, collections });
  })

  // GET /api/collections/:slug
  // Used for the "Stop" page (e.g., /collection/wedding)
  .get("/:slug", async (c: Context) => {
    const slug = c.req.param("slug");

    const result = await db.query.collection.findFirst({
      where: eq(collection.slug, slug),
      with: {
        productCollections: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!result) return c.json({ error: "Collection not found" }, 404);

    // Flatten for easy frontend consumption
    const products =
      result.productCollections ?? [].map((pc: any) => pc.product);

    return c.json({
      success: true,
      collection: {
        name: result.name,
        description: result.description,
        image: result.image,
      },
      products,
    });
  });
