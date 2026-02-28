// // GET /categories
// // GET /categories/:slug
// // GET /categories/:slug/products

// import { Hono, Context } from "hono";
// import { collection, db, eq, product, productCollection } from "@repo/db";

// export const categoriesHandler = new Hono()
//   .get("/", async (c: Context) => {
//     const categories = await db
//       .select()
//       .from(categories)
//       .orderBy(collection.name);
//     return c.json({ cols });
//   })
//   .get("/:slug/products", async (c: Context) => {
//     const slug = c.req.param("slug");
//     const col = await db
//       .select()
//       .from(collection)
//       .where(eq(collection.slug, slug))
//       .limit(1)
//       .then((r) => r[0]);
//     if (!col) return c.json({ error: "Collection not found" }, 404);

//     const productsInCollection = await db
//       .select()
//       .from(product)
//       .innerJoin(
//         productCollection,
//         eq(product.id, productCollection.product_id),
//       )
//       .where(eq(productCollection.collection_id, col.id));

//     return c.json({ collection: col, products: productsInCollection });
//   });
