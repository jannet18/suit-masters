// // GET /products
// // GET /products/:slug
// // GET /products?category=
// // GET /products?collection=
import { Hono } from "hono";
import { db, product } from "@repo/db";
import { getUser, type AuthContext } from "@repo/auth";

const requireAdmin = async (c: any, next: () => Promise<void>) => {
  const user = c.get("user");
  if (!user || (user as { roles?: string })?.roles !== "ADMIN") {
    return c.json({ error: "Access Denied: Unauthorised" }, 403);
  }
  await next();
};

// Public product catalog routes
// - GET /products                -> list products (optional ?category=&search=)
// - GET /products/:slug          -> product detail with customizationGroups

export const productsHandler = new Hono<AuthContext>()
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

  /**
   * GET /products/fabrics
   * List available fabrics (for the admin product-creation form).
   */
  .get("/fabrics", async (c) => {
    try {
      const fabrics = await db.query.fabric.findMany({
        where: (f, { eq: eqFn }) => eqFn(f.isActive, true),
        orderBy: (f, { asc }) => [asc(f.name)],
      });
      return c.json({ success: true, fabrics });
    } catch (error) {
      console.error("Error fetching fabrics", error);
      return c.json({ success: false, fabrics: [] }, 500);
    }
  })

  /**
   * POST /products
   * Admin: create a new product.
   */
  .post("/", getUser, requireAdmin, async (c) => {
    try {
      const body = await c.req.json<{
        name: string;
        slug?: string;
        categoryId: number;
        fabricId: number;
        productType?: "STANDARD" | "CUSTOM";
        basePrice: number;
        description?: string;
        mainImage?: string;
        productImage?: string;
        isActive?: boolean;
      }>();

      if (!body.name || !body.categoryId || !body.fabricId || body.basePrice == null) {
        return c.json(
          { success: false, error: "name, categoryId, fabricId, and basePrice are required" },
          400,
        );
      }

      const slug =
        body.slug?.trim() ||
        body.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const [newProduct] = await db
        .insert(product)
        .values({
          name: body.name,
          slug,
          categoryId: body.categoryId,
          fabricId: body.fabricId,
          productType: body.productType || "CUSTOM",
          basePrice: body.basePrice.toFixed(2),
          description: body.description,
          mainImage: body.mainImage,
          productImage: body.productImage,
          isActive: body.isActive ?? true,
        })
        .returning();

      return c.json({ success: true, product: newProduct }, 201);
    } catch (error: any) {
      if (error?.code === "23505") {
        return c.json({ success: false, error: "A product with that slug already exists" }, 409);
      }
      console.error("Error creating product", error);
      return c.json({ success: false, error: "Failed to create product" }, 500);
    }
  })

  /** customised to eliminate the N+1 problem - instead of making single queries for each product
   * Verifies the retrieved customisation actually belong to the product's category - closing the vulnerability where invalid options could be injected into the product configuration
   */
  .get("/:slug", async (c) => {
    const slug = c.req.param("slug");

    try {
      // 1. Fetch the base product details
      const dbProduct = await db.query.product.findFirst({
        where: (p, { eq }) => eq(p.slug, slug),
      });

      if (!dbProduct) {
        return c.json(
          { success: false, product: null, error: "Product not found" },
          404,
        );
      }

      // 2. Batch-fetch all customisation groups for this category to avoid N+1 queries
      const customizationGroups = await db.query.customizationGroup.findMany({
        where: (group, { eq }) => eq(group.categoryId, dbProduct.categoryId),
        orderBy: (group, { asc }) => [asc(group.displayOrder)],
      });

      let groupsWithOptions: any[] = [];
      const groupIds = customizationGroups.map((group) => group.id);

      // 3. Batch-fetch all options for the retrieved groups in exactly ONE query
      const allOptions = await db.query.customizationOption.findMany({
        where: (option, { inArray }) => inArray(option.groupId, groupIds),
        orderBy: (option, { asc }) => [asc(option.id)],
      });

      // 4. Group options by their groupId for easy mapping
      const optionsByGroupId = allOptions.reduce<Record<number, any[]>>((acc, option) => {
        const gid = option.groupId as number;
        if (!acc[gid]) {
          acc[gid] = [];
        }
        acc[gid].push({
          id: option.id,
          name: option.name,
          value: option.value,
          priceDelta: Number(option.priceDelta),
          thumbnailUrl: option.thumbnailUrl,
          imageUrl: (option as any).imageUrl || null,
          texture: (option as any).texture || null,
          metadata: (option as any).metadata || {},
          factoryCode: option.factoryCode,
        });
        return acc;
      }, {} as Record<number, any[]>);

      // 5.Map the customization options to include their respective parent customization gropus
      groupsWithOptions = customizationGroups.map((group) => ({
        id: group.id,
        name: group.name,
        isRequired: group.isRequired,
        displayOrder: group.displayOrder,
        options: optionsByGroupId[group.id] || [],
      }));
    


      // const groupsWithOptions = await Promise.all(
      //   customizationGroups.map(async (group) => {
      //     const options = await db.query.customizationOption.findMany({
      //       where: (option, { eq }) => eq(option.groupId, group.id),
      //       orderBy: (option, { asc }) => [asc(option.id)],
      //     });

      //     return {
      //       id: group.id,
      //       name: group.name,
      //       isRequired: group.isRequired,
      //       displayOrder: group.displayOrder,
      //       options: options.map((option: any) => ({
      //         id: option.id,
      //         name: option.name,
      //         value: option.value,
      //         priceDelta: Number(option.priceDelta),
      //         thumbnailUrl: option.thumbnailUrl,
      //         imageUrl: (option as any).imageUrl || null,
      //         texture: (option as any).texture || null,
      //         metadata: (option as any).metadata || {},
      //         factoryCode: option.factoryCode,
      //       })),
      //     };
      //   }),
      // );

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
