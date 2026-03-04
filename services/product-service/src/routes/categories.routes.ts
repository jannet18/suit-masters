// // GET /categories
// // GET /categories/:slug
// // GET /categories/:slug/products
//   });
import { Hono } from "hono";
import { db, eq } from "@repo/db";
import { product } from "@repo/db";

// export const productRoutes = new Hono();

// productRoutes.get("/", async (c) => {
//   const categorySlug = c.req.query("category");

//   try {
//     if (!categorySlug) {
//       const products = await db.select().from(product);
//       return c.json({ success: true, products });
//     }

//     // Find category first
//     const category = await db.query.productCategory.findFirst({
//       where: (cat, { eq }) => eq(cat.slug, categorySlug),
//     });

//     if (!category) {
//       return c.json({ success: false, error: "Category not found" }, 404);
//     }

//     const products = await db
//       .select()
//       .from(product)
//       .where(eq(product.category_id, category.id));

//     return c.json({ success: true, products });
//   } catch (err) {
//     return c.json({ success: false }, 500);
//   }
// });

// productRoutes.get("/:slug", async (c) => {
//   const slug = c.req.param("slug");

//   const result = await db.query.product.findFirst({
//     where: (p, { eq }) => eq(p.slug, slug),
//   });

//   if (!result) {
//     return c.json({ success: false, error: "Product not found" }, 404);
//   }

//   return c.json({ success: true, product: result });
// });

// backend/routes/categories.ts
export const categoryRoutes = new Hono()
  .get("/", async (c) => {
    const categories = await db.query.productCategory.findMany({
      where: (cat, { isNull }) => isNull(cat.parent_id), // Gets top-level categories only
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
