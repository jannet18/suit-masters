// // GET /products
// // GET /products/:slug
// // GET /products?category=
// // GET /products?collection=

// import { Context, Hono } from "hono";
// import { asc, customizationGroup, eq } from "@repo/db";
// import { customizationOption, db, product } from "@repo/db";

// interface CustomizationItem {
//   id: number;
//   product_id: number | null;
//   group_id: number;
//   value: string;
//   price_delta: string | null;
//   metadata: unknown;
//   is_default: boolean | null;
// }

// interface CustomizationGroup {
//   id: number;
//   name?: string;
//   items?: CustomizationItem[];
// }
// export const productsHandler = new Hono()
//   .get("/", async (c) => {
//     const categorySlug = c.req.query("category");
//     const searchQuery = c.req.query("search");

//     try {
//       let categoryId: number | undefined;

//       // 1. If a category slug is provided, find the ID first
//       if (categorySlug) {
//         const categoryData = await db.query.productCategory.findFirst({
//           where: (cat, { eq }) => eq(cat.slug, categorySlug),
//         });

//         if (!categoryData) {
//           return c.json({
//             success: false,
//             products: [],
//             message: "Category not found",
//           });
//         }
//         categoryId = categoryData.id;
//       }

//       // 2. Fetch products with the optional filters
//       const products = await db.query.product.findMany({
//         where: (p, { eq, and, ilike }) => {
//           const filters = [];
//           if (categoryId) filters.push(eq(p.categoryId, categoryId));
//           if (searchQuery) filters.push(ilike(p.name, `%${searchQuery}%`));
//           return filters.length > 0 ? and(...filters) : undefined;
//         },
//         orderBy: (p, { desc }) => [desc(p.createdAt)],
//       });

//       return c.json({ success: true, products });
//     } catch (err) {
//       console.error(err);
//       return c.json({ success: false, products: [] }, 500);
//     }
//   })
//   .get("/:slug", async (c: Context) => {
//     const slug = c.req.param("slug");

//     const result = await db.query.product.findFirst({
//       where: (p, { eq }) => eq(p.slug, slug),
//       with: {
//         // explicitly define result to avoid undefined
//         category: true,
//         customizationGroup: {
//           with: {
//             opttions: true,
//           },
//         },
//       },
//     });

//     if (!result) {
//       return c.json({ success: false, error: "Product not found" }, 404);
//     }

//     return c.json({ success: true, product: result });
//   });
// // .get("/:id", async (c: Context) => {
// //   const id = Number(c.req.param("id"));
// //   if (Number.isNaN(id)) {
// //     return c.json({ error: "Invalid product ID" }, 400);
// //   }
// //   try {
// //     // 1.Fetch product details
// //     const productData = await db
// //       .select()
// //       .from(product)
// //       .where(eq(product.id, id))
// //       .limit(1)
// //       .then((res: any) => res[0]);
// //     if (!productData.length) {
// //       return c.json({ error: "Product not found" }, 404);
// //     }
// //     // 2. Fetch customization groups/options if it's a CUSTOM product
// //     let customizationGroups: CustomizationGroup[] = [];
// //     if (productData.product_type === "CUSTOM") {
// //       const options = await db
// //         .select()
// //         .from(customizationOption)
// //         .where(eq(customizationOption.product_id, id));

// //       // Group options by group_id
// //       const groupMap = new Map<number, CustomizationGroup>();
// //       options.forEach((option: any) => {
// //         if (!groupMap.has(option.group_id)) {
// //           groupMap.set(option.group_id, {
// //             id: option.group_id,
// //             name: "", // You can fetch group name if needed
// //             items: [],
// //           });
// //         }
// //         groupMap.get(option.group_id)?.items?.push(option);
// //       });

// //       // Convert map to array
// //       customizationGroups = Array.from(groupMap.values());
// //     }

// //     return c.json({
// //       ...productData,
// //       options: customizationGroups,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching product details:", error);
// //     return c.json({ error: "Failed to fetch product details" }, 500);
// //   }
// // });

// //   app.get('/configurator/init', async (c) => {
// //   const options = await db.select().from(customOptions).where(eq(customOptions.isActive, true));
// //   const constraints = await db.select().from(optionConstraints);

// //   // We return a "Global Config" object
// //   return c.json({
// //     options: {
// //       fabrics: options.filter(o => o.category === 'fabric'),
// //       lapels: options.filter(o => o.category === 'lapel'),
// //       buttons: options.filter(o => o.category === 'button'),
// //       linings: options.filter(o => o.category === 'lining'),
// //     },
// //     constraints
// //   });
// // });
// // Example of a product details response structure
// /*
// {
//   "id": 1,
//   "name": "The Executive Italian Suit",
//   "description": "A luxurious suit made from the finest Italian wool.",
//   "image_url": "https://example.com/images/italian-suit.jpg",
//   "product_type": "CUSTOM",
//   "base_price": "799.00",
//   "options": [
//     {
//       "id": 1,
//       "name": "Lapel Style",
//       "items": [
//         {
//           "id": 1,
//           "group_id": 1,
//           "value": "Notch Lapel",
//           "price_delta": "0",
//           "is_default": true
//         },
//         {
//           "id": 2,
//           "group_id": 1,
//           "value": "Peak Lapel",
//           "price_delta": "50.00",
//           "is_default": false
//         },
//         {
//           "id": 3,
//           "group_id": 1,
//           "value": "Shawl Lapel",
//           "price_delta": "75.00",
//           "is_default": false
//         }
//       ]
//     },
//     {
//       "id": 2,
//       "name": "Fabric",
//       "items": [
//         {
//           "id": 4,
//           "group_id": 2,
//           "value": "Italian Wool",
//           "price_delta": "0",
//           "is_default": true
//         },
//         {
//           "id": 5,
//           "group_id": 2,
//           "value": "British Wool",
//           "price_delta": "100.00",
//           "is_default": false
//         }
//       ]
//     }
//   ]
// }
// */

import { Hono } from "hono";
import { db } from "@repo/db";

// Public product catalog routes
// - GET /products                -> list products (optional ?category=&search=)
// - GET /products/:slug          -> product detail with customizationGroups

export const productsHandler = new Hono()
  .get("/", async (c) => {
    const categorySlug = c.req.query("category");
    const searchQuery = c.req.query("search");

    try {
      let categoryId: number | undefined;

      // If a category slug is provided, resolve it to an ID first
      if (categorySlug) {
        const category = await db.query.productCategory.findFirst({
          where: (cat, { eq }) => eq(cat.slug, categorySlug),
        });

        if (!category) {
          return c.json(
            {
              success: false,
              products: [],
              message: "Category not found",
            },
            404,
          );
        }
        categoryId = category.id;
      }

      const rawProducts = await db.query.product.findMany({
        where: (p, { and, eq, ilike }) => {
          const filters = [];
          if (categoryId) filters.push(eq(p.categoryId, categoryId));
          if (searchQuery) filters.push(ilike(p.name, `%${searchQuery}%`));
          return filters.length ? and(...filters) : undefined;
        },
        orderBy: (p, { desc }) => [desc(p.id)],
      });

      const products = rawProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        base_price: Number(p.basePrice),
        product_image: p.mainImage,
        product_type: "CUSTOM" as const,
      }));

      return c.json({ success: true, products });
    } catch (error) {
      console.error("Error fetching products", error);
      return c.json({ success: false, products: [] }, 500);
    }
  })
  .get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    try {
      const dbProduct = (await db.query.product.findFirst({
        where: (p, { eq }) => eq(p.slug, slug),
        with: {
          category: {
            with: {
              customizationGroups: {
                with: {
                  options: true,
                },
              },
            },
          },
        },
      })) as any;

      if (!dbProduct) {
        return c.json(
          { success: false, product: null, error: "Product not found" },
          404,
        );
      }

      // Map DB customization structure into the UI-friendly shape
      const customizationGroups =
        dbProduct.category?.customizationGroups?.map((group: any) => ({
          id: group.id,
          name: group.name,
          options: group.options?.map((opt: any) => ({
            id: opt.id,
            value: opt.name,
            price_delta: opt.priceDelta,
            metadata: {
              thumbnailUrl: opt.thumbnailUrl,
              factoryCode: opt.factoryCode,
            },
          })),
        })) ?? [];

      const responseProduct = {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        base_price: Number(dbProduct.basePrice),
        product_image: dbProduct.mainImage,
        product_type: "CUSTOM" as const,
        customizationGroups,
      };

      return c.json({ success: true, product: responseProduct });
    } catch (error) {
      console.error("Error fetching product by slug", error);
      return c.json(
        {
          success: false,
          product: null,
          error: "Failed to fetch product",
        },
        500,
      );
    }
  });
