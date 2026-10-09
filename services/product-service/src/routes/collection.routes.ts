import {
  db,
  collection,
  product,
  productCollection,
  productCategory,
} from "@repo/db";
import { eq, and, asc, inArray } from "@repo/db";
import { Context, Hono } from "hono";

export const collectionsHandler = new Hono()
  // 1. List all collections (e.g. Wedding, Evening, Boardroom, Smart Casual)
  .get("/", async (c: Context) => {
    try {
      // Active collections in the order the admin arranged them
      const lifestyleCollections = await db
        .select()
        .from(collection)
        .where(eq(collection.isActive, true))
        .orderBy(asc(collection.sortOrder), asc(collection.id));

      // Map DB collections into the frontend Collection view model
      const collections = lifestyleCollections.map((col, index) => ({
        id: col.id,
        slug: col.slug,
        title: col.name,
        subtitle: "Bespoke collection",
        description:
          col.description ||
          `Explore our ${col.name.toLowerCase()} collection.`,
        image:
          col.image ||
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

  // 2. Get a specific collection and its products with proper joins
  .get("/:slug", async (c: Context) => {
    const slug = c.req.param("slug");

    try {
      // First, get the collection
      const collectionData = await db
        .select()
        .from(collection)
        .where(and(eq(collection.slug, slug), eq(collection.isActive, true)))
        .limit(1);

      if (collectionData.length === 0) {
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

      const collectionItem = collectionData[0]!;

      // Then get products linked to this collection with their categories
      const productLinks = await db
        .select()
        .from(productCollection)
        .where(eq(productCollection.collection_id, collectionItem.id));

      // Get product details for each linked product, including product_type and category
      const productIds = productLinks.map((link) => link.product_id);
      let products: any[] = [];

      if (productIds.length > 0) {
        // Join to get product details with category name
        const productData = await db
          .select({
            id: product.id,
            slug: product.slug,
            name: product.name,
            basePrice: product.basePrice,
            mainImage: product.mainImage,
            productType: product.productType,
            categoryName: productCategory.name,
          })
          .from(product)
          .innerJoin(
            productCategory,
            eq(product.categoryId, productCategory.id),
          )
          .where(
            and(inArray(product.id, productIds), eq(product.isActive, true)),
          );

        products = productData.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          base_price: p.basePrice,
          product_image: p.mainImage,
          product_type: p.productType,
          category_name: p.categoryName,
        }));
      }

      const collectionResponse = {
        slug: collectionItem.slug,
        name: collectionItem.name,
        description:
          collectionItem.description ||
          `Explore our ${collectionItem.name.toLowerCase()} collection.`,
        image:
          collectionItem.image ||
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80&auto=format&fit=crop",
      };

      return c.json({
        success: true,
        collection: collectionResponse,
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
      where: and(eq(product.slug, productSlug), eq(product.isActive, true)),
    });

    if (!data) return c.json({ error: "Product not found" }, 404);

    const responseProduct = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      base_price: data.basePrice,
      product_image: data.mainImage,
      product_type: data.productType,
    };

    return c.json(responseProduct);
  });
