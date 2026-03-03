// // // GET /collections
// // // GET /collections/:slug
// // // GET /collections/:slug/products
// // // routes/collections.route.ts
// // import { Hono, Context } from "hono";
// // import { asc, collection, db, eq, product, productCollection } from "@repo/db";

// // export const collectionsHandler = new Hono()
// //   // .get("/", async (c: Context) => {
// //   //   try {
// //   //     const collections = await db
// //   //       .select()
// //   //       .from(collection)
// //   //       .orderBy(asc(collection.name));
// //   //     return c.json({ success: true, collections });
// //   //   } catch (error) {
// //   //     console.error("Error fetching collections:", error);
// //   //     return c.json({ error: "Failed to fetch collection" }, 500);
// //   //   }
// //   // })
// //   .get("/", async (c: Context) => {
// //     try {
// //       // const collections = await db.select().from(collection);
// //       const collections = await db.query.collection.findMany({
// //         orderBy: [asc(collection.name)],
// //       });

// //       // Map DB fields to frontend grid structure
// //       const mapped = collections.map((col, index: number) => ({
// //         title: `The ${col.name}`, // Example: "The Boardroom"
// //         subtitle: col.name === "Boardroom" ? "Power Suits" : "Collection", // Customize per collection
// //         description: col.description,
// //         image:
// //           col.name === "Boardroom"
// //             ? "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop"
// //             : "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80&fit=crop", // fallback
// //         tag: index === 0 ? "Bestseller" : undefined, // Example first one is tagged
// //         span:
// //           index === 0
// //             ? "lg:col-span-2 lg:row-span-2"
// //             : "lg:col-span-1 lg:row-span-1",
// //         slug: col.slug, // Keep slug for navigation
// //       }));

// //       return c.json({ success: true, collections: mapped });
// //     } catch (err) {
// //       console.error("Error fetching collections:", err);
// //       return c.json(
// //         { success: false, error: "Failed to fetch collections" },
// //         500,
// //       );
// //     }
// //   })
// //   // .get("/:slug/products", async (c: Context) => {
// //   //   const slug = c.req.param("slug");
// //   //   try {
// //   //     // Find collection by slug
// //   //     const col = await db
// //   //       .select()
// //   //       .from(collection)
// //   //       .where(eq(collection.slug, slug))
// //   //       .limit(1)
// //   //       .then((r) => r[0]);
// //   //     if (!col) return c.json({ error: "Collection not found" }, 404);
// //   //     const productsInCollection = await db
// //   //       .select()
// //   //       .from(product)
// //   //       .innerJoin(
// //   //         productCollection,
// //   //         eq(product.id, productCollection.product_id),
// //   //       )
// //   //       .where(eq(productCollection.collection_id, col.id))
// //   //       .orderBy(asc(product.name));

// //   //     return c.json({
// //   //       success: true,
// //   //       collection: col,
// //   //       products: productsInCollection,
// //   //     });
// //   //   } catch (error) {
// //   //     console.error("Error fetching products for collection:", error);
// //   //     return c.json({ error: "Failed to fetch products for collection" });
// //   //   }
// //   // });

// //   .get("/:slug/products", async (c: Context) => {
// //     const slug = c.req.param("slug");
// //     try {
// //       // Find collection by slug
// //       const col = await db
// //         .select()
// //         .from(collection)
// //         .where(eq(collection.slug, slug))
// //         .limit(1)
// //         .then((r) => r[0]);
// //       if (!col) return c.json({ error: "Collection not found" }, 404);
// //       const productsInCollection = await db
// //         .select({
// //           id: product.id,
// //           name: product.name,
// //           slug: product.slug,
// //           product_image: product.product_image,
// //           base_price: product.base_price,
// //           product_type: product.product_type,
// //         })
// //         .from(productCollection)
// //         .innerJoin(product, eq(productCollection.product_id, product.id))
// //         .where(eq(productCollection.collection_id, col.id))
// //         .orderBy(asc(product.name));

// //       return c.json({
// //         success: true,
// //         collection: col,
// //         products: productsInCollection,
// //       });
// //     } catch (error) {
// //       console.error("Error fetching products for collection:", error);
// //       return c.json({ error: "Failed to fetch products for collection" });
// //     }
// //   });

// // import { Hono, Context } from "hono";
// // import { db, collection, product } from "@repo/db";
// // import { eq, asc } from "drizzle-orm";

// import { asc, collection, db, eq } from "@repo/db";
// import { Context, Hono } from "hono";

// export const collectionsHandler = new Hono()
//   // 1. Fetch All Collections (For the Bento/Grid UI)
//   .get("/", async (c: Context) => {
//     try {
//       const collections = await db.query.collection.findMany({
//         orderBy: [asc(collection.name)],
//       });

//       const mapped = collections.map((col, index: number) => ({
//         title: `The ${col.name}`,
//         subtitle: col.name === "Boardroom" ? "Power Suits" : "Collection",
//         description: col.description,
//         image: col.image || "https://fallback-url.com/image.jpg",
//         tag: index === 0 ? "Bestseller" : undefined,
//         span:
//           index === 0
//             ? "lg:col-span-2 lg:row-span-2"
//             : "lg:col-span-1 lg:row-span-1",
//         slug: col.slug,
//       }));

//       return c.json({ success: true, collections: mapped });
//     } catch (err) {
//       return c.json(
//         { success: false, error: "Failed to fetch collections" },
//         500,
//       );
//     }
//   })

//   // 2. Fetch Single Collection + Products (One Request)
//   .get("/:slug/products", async (c: Context) => {
//     const slug = c.req.param("slug");

//     try {
//       // Using Drizzle Relations to fetch the collection AND its linked products in one go
//       const result = await db.query.collection.findFirst({
//         where: eq(collection.slug, slug),
//         with: {
//           productCollections: {
//             with: {
//               product: true, // This automatically joins through product_collection
//             },
//           },
//         },
//       });

//       if (!result) return c.json({ error: "Collection not found" }, 404);

//       // Flatten the relational structure for the frontend
//       const products =
//         result?.productCollections ?? [].map((pc: any) => pc.product);

//       return c.json({
//         success: true,
//         collection: {
//           name: result.name,
//           description: result.description,
//           image: result.image,
//         },
//         products: products,
//       });
//     } catch (error) {
//       console.error(error);
//       return c.json({ error: "Failed to fetch products for collection" }, 500);
//     }
//   });

// collections.handler.ts
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
      result?.productCollections ?? [].map((pc: any) => pc.product);

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
