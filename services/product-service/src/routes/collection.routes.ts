import { db, productCategory, product } from "@repo/db";
import { eq, isNull, and } from "@repo/db";
import { Context, Hono } from "hono";

export const collectionsHandler = new Hono()
  // 1. List all main categories (e.g. Suits, Shirts, Coats)
  .get("/", async (c: Context) => {
    try {
      const categories = await db.query.productCategory.findMany({
        where: (category, { isNull }) => isNull(category.parentId),
      });

      // Map DB categories into the frontend Collection view model
      const collections = categories.map((cat, index) => ({
        id: cat.id,
        slug: cat.slug,
        title: cat.name,
        subtitle: "Bespoke collection",
        description: `Explore our ${cat.name.toLowerCase()} collection.`,
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
        name: data.name,
        description: `Explore our ${data.name.toLowerCase()} collection.`,
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80&auto=format&fit=crop",
      };

      const products = (data.products as any[]).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        base_price: Number(p.basePrice),
        product_image: p.mainImage,
        product_type: "CUSTOM" as const,
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

    const responseProduct = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      base_price: Number(data.basePrice),
      product_image: data.mainImage,
      product_type: "CUSTOM" as const,
    };

    return c.json(responseProduct);
  });
