// import { asc, collection, db, eq, product, productCollection } from "@repo/db";
// import { Context, Hono } from "hono";

// export const collectionsHandler = new Hono()
//   .get("/", async (c: Context) => {
//     const allCollections = await db.query.productCategory.findMany({
//       where: (category, { isNull }) => isNull(category.parent_id),
//     });
//   })

//   .get("/collections/:slug", async (c: Context) => {
//      const slug = c.req.param("slug");
//     const collection = await db.query.productCategory.findFirst({
//       where: (category, { eq }) => eq(category.slug, params.slug),
//       with: {
//         products: {
//           with: {
//             fabric: true, // Show the material name/image on the card
//           },
//         },
//       },
//     });
//   })
//   .get("/collections/:slug/:productSlug", async (c: Context) => {
//     const productDetail = await db.query.product.findFirst({
//       where: (product, { eq }) => eq(product.slug, params.productSlug),
//       with: {
//         fabric: true,
//         category: {
//           with: {
//             customizationGroups: {
//               orderBy: (groups, { asc }) => [asc(groups.displayOrder)],
//               with: {
//                 options: true, // Notch lapel, Peak lapel, etc.
//               },
//             },
//           },
//         },
//       },
//     });
//   });
// // GET /api/collections
// // Used for the Bento/Grid landing page
// // .get("/", async (c: Context) => {
// //   const data = await db.query.collection.findMany({
// //     orderBy: [asc(collection.name)],
// //   });

// //   const collections = data.map((col, i) => ({
// //     title: col.name,
// //     slug: col.slug,
// //     image: col.image,
// //     description: col.description,
// //     // Logic for bento spans
// //     span: i === 0 ? "wide" : "standard",
// //   }));

// //   return c.json({ success: true, collections });
// // })

// // // GET /api/collections/:slug
// // // Used for the "Stop" page (e.g., /collection/wedding)
// // .get("/:slug", async (c: Context) => {
// //   const slug = c.req.param("slug");

// //   const result = await db.query.collection.findFirst({
// //     where: eq(collection.slug, slug),
// //     with: {
// //       productCollections: {
// //         with: {
// //           product: true,
// //         },
// //       },
// //     },
// //   });

// //   if (!result) return c.json({ error: "Collection not found" }, 404);

// //   // Flatten for easy frontend consumption
// //   const products =
// //     result?.productCollections ?? [].map((pc: any) => pc.product);

// //   return c.json({
// //     success: true,
// //     collection: {
// //       name: result.name,
// //       description: result.description,
// //       image: result.image,
// //     },
// //     products,
// //   });
// // });

// // GET /:SLUG
// // .get("/collections/:slug", async (c: Context) => {
// //   const slug = c.req.param("slug");

// //   const result = await db.query.collection.findFirst({
// //     where: (collection, { eq }) => eq(collection.slug, slug),
// //     // with: {
// //     //   productCollection: {
// //     //     with: {
// //     //       product: true,
// //     //     },
// //     //   },
// //     // },
// //   });
// //   if (!result)
// //     return c.json({ success: false, error: "Collection not found" }, 404);
// //   // EXTRACT PRODUCT FROM JOIN TABLE
// //   const flattenedProducts =
// //     result.productCollection ?? [].map((pc: any) => pc.product);

// //   return c.json({
// //     success: true,
// //     collection: {
// //       name: result.name,
// //       description: result.description,
// //       image: result.image,
// //     },
// //     products: flattenedProducts,
// //   });
// // });
import { db, productCategory, product } from "@repo/db";
import { eq, isNull, and } from "@repo/db";
import { Context, Hono } from "hono";

export const collectionsHandler = new Hono()
  // 1. List all main categories (e.g. Suits, Shirts, Coats)
  .get("/", async (c: Context) => {
    try {
      const categories = await db.query.productCategory.findMany({
        where: (category, { isNull }) => isNull(category.parent_id),
      });

      // Map DB categories into the frontend Collection view model
      const collections = categories.map((cat, index) => ({
        id: cat.id,
        slug: cat.slug,
        title: cat.category_name,
        subtitle: "Bespoke collection",
        description: `Explore our ${cat.category_name.toLowerCase()} collection.`,
        // Simple visual placeholder – you can replace with real assets later
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80&auto=format&fit=crop",
        tag: index === 0 ? "Featured" : undefined,
        span: index === 0 ? "wide" : undefined,
      }));

      return c.json({ success: true, collections });
    } catch (error) {
      console.error("Error fetching collections", error);
      return c.json(
        {
          success: false,
          collections: [],
          error: "Failed to fetch collections",
        },
        500,
      );
    }
  })

  // 2. Get a specific collection and its products
  .get("/:slug", async (c: Context) => {
    const slug = c.req.param("slug");

    try {
      const data = await db.query.productCategory.findFirst({
        where: eq(productCategory.slug, slug),
        with: {
          products: {
            where: eq(product.isActive, true),
          },
        },
      });

      if (!data) {
        return c.json(
          {
            success: false,
            collection: null,
            products: [],
            error: "Collection not found",
          },
          404,
        );
      }

      const collection = {
        slug: data.slug,
        name: data.category_name,
        description: `Explore our ${data.category_name.toLowerCase()} collection.`,
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80&auto=format&fit=crop",
      };

      const products = (data.products as any[]).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        base_price: Number(p.basePrice),
        product_image: p.productImage,
        product_type: p.productType,
      }));

      return c.json({
        success: true,
        collection,
        products,
      });
    } catch (error) {
      console.error("Error fetching collection", error);
      return c.json(
        {
          success: false,
          collection: null,
          products: [],
          error: "Failed to fetch collection",
        },
        500,
      );
    }
  })

  // 3. Get the specific product with all its builder options
  .get("/:slug/:productSlug", async (c: Context) => {
    const productSlug = c.req.param("productSlug");

    const data = await db.query.product.findFirst({
      where: eq(product.slug, productSlug),
    });

    if (!data) return c.json({ error: "Product not found" }, 404);

    return c.json(data);
  });
