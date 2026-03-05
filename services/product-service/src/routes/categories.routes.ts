// // GET /categories
// // GET /categories/:slug
// // GET /categories/:slug/products
//   });
import { Hono } from "hono";
import { db, eq } from "@repo/db";
import { product } from "@repo/db";

export const categoryRoutes = new Hono()
  .get("/", async (c) => {
    const categories = await db.query.productCategory.findMany({
      where: (cat, { isNull }) => isNull(cat.parentId), // Gets top-level categories only
    });
    return c.json({ success: true, categories });
  })
  .get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    const category = await db.query.productCategory.findFirst({
      where: (cat, { eq }) => eq(cat.slug, slug),
    });
    return c.json({ success: true, category });
  });
