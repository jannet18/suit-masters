// // GET /products
// // GET /products/:slug
// // GET /products?category=
// // GET /products?collection=
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
        product_image: { default: p.mainImage || p.productImage || "" },
        product_type: p.productType,
        description: p.description || "",
        is_active: p.isActive,
      }));

      return c.json({ success: true, products });
    } catch (error) {
      console.error("Error fetching products", error);
      return c.json({ success: false, products: [] }, 500);
    }
  })
  // Search suggestions for autocomplete
  .get("/suggestions", async (c) => {
    const searchQuery = c.req.query("q");
    const limit = parseInt(c.req.query("limit") || "5");

    if (!searchQuery || searchQuery.trim().length < 2) {
      return c.json({
        success: true,
        suggestions: [],
        message: "Query too short",
      });
    }

    try {
      // Search across multiple fields for better suggestions
      const products = await db.query.product.findMany({
        where: (p, { or, ilike }) => {
          return or(
            ilike(p.name, `%${searchQuery}%`),
            ilike(p.description, `%${searchQuery}%`),
            ilike(p.slug, `%${searchQuery}%`),
          );
        },
        limit: Math.min(limit, 10), // Max 10 suggestions
        orderBy: (p, { desc }) => [desc(p.id)], // Most recent first
      });

      // Format suggestions for autocomplete
      const suggestions = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.basePrice),
        image: p.mainImage || p.productImage || "",
        type: "product" as const,
      }));

      // Also get category suggestions
      const categories = await db.query.productCategory.findMany({
        where: (cat, { or, ilike }) => {
          return or(
            ilike(cat.name, `%${searchQuery}%`),
            ilike(cat.slug, `%${searchQuery}%`),
          );
        },
        limit: Math.min(3, limit), // Max 3 category suggestions
      });

      const categorySuggestions = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        type: "category" as const,
      }));

      return c.json({
        success: true,
        suggestions: [...suggestions, ...categorySuggestions],
        query: searchQuery,
      });
    } catch (error) {
      console.error("Error fetching search suggestions", error);
      return c.json(
        {
          success: false,
          suggestions: [],
          error: "Failed to fetch suggestions",
        },
        500,
      );
    }
  })
  .get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    try {
      // Fetch product
      const dbProduct = await db.query.product.findFirst({
        where: (p, { eq }) => eq(p.slug, slug),
      });

      if (!dbProduct) {
        return c.json(
          { success: false, product: null, error: "Product not found" },
          404,
        );
      }

      // Fetch customization groups for this product's category
      const customizationGroups = await db.query.customizationGroup.findMany({
        where: (group, { eq }) => eq(group.categoryId, dbProduct.categoryId),
        orderBy: (group, { asc }) => [asc(group.displayOrder)],
      });

      // Fetch options for each group
      const groupsWithOptions = await Promise.all(
        customizationGroups.map(async (group) => {
          const options = await db.query.customizationOption.findMany({
            where: (option, { eq }) => eq(option.groupId, group.id),
            orderBy: (option, { asc }) => [asc(option.id)],
          });

          return {
            id: group.id,
            name: group.name,
            isRequired: group.isRequired,
            displayOrder: group.displayOrder,
            options: options.map((option: any) => ({
              id: option.id,
              name: option.name,
              value: option.value,
              priceDelta: Number(option.priceDelta),
              thumbnailUrl: option.thumbnailUrl,
              imageUrl: (option as any).imageUrl || null,
              texture: (option as any).texture || null,
              metadata: (option as any).metadata || {},
              factoryCode: option.factoryCode,
            })),
          };
        }),
      );

      const responseProduct = {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        base_price: Number(dbProduct.basePrice),
        product_image: {
          default: dbProduct.mainImage || dbProduct.productImage || "",
        },
        product_type: dbProduct.productType,
        description: dbProduct.description || "",
        is_active: dbProduct.isActive,
        category_id: dbProduct.categoryId,
        fabric_id: dbProduct.fabricId,
        customizationGroups: groupsWithOptions,
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
