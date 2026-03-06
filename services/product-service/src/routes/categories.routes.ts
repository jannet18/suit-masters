import { Hono } from "hono";
import { db } from "@repo/db";

export const categoryRoutes = new Hono()
  .get("/", async (c) => {
    const categories = await db.query.productCategory.findMany({
      where: (cat, { isNull }) => isNull(cat.parentId), // Gets top-level categories only
    });
    return c.json({ success: true, categories });
  })
  // Nested category routes: /categories/parent-slug/child-slug
  .get("/:parentSlug/:childSlug", async (c) => {
    const parentSlug = c.req.param("parentSlug");
    const childSlug = c.req.param("childSlug");

    // First, find the parent category
    const parentCategory = await db.query.productCategory.findFirst({
      where: (cat, { eq }) => eq(cat.slug, parentSlug),
    });

    if (!parentCategory) {
      return c.json(
        { success: false, error: "Parent category not found" },
        404,
      );
    }

    // Find the child category with matching slug and parentId
    const childCategory = await db.query.productCategory.findFirst({
      where: (cat, { and, eq }) =>
        and(eq(cat.slug, childSlug), eq(cat.parentId, parentCategory.id)),
    });

    if (!childCategory) {
      return c.json({ success: false, error: "Child category not found" }, 404);
    }

    return c.json({
      success: true,
      parentCategory,
      childCategory,
    });
  })
  // Nested category products: /categories/parent-slug/child-slug/products
  .get("/:parentSlug/:childSlug/products", async (c) => {
    const parentSlug = c.req.param("parentSlug");
    const childSlug = c.req.param("childSlug");

    // First, find the parent category
    const parentCategory = await db.query.productCategory.findFirst({
      where: (cat, { eq }) => eq(cat.slug, parentSlug),
    });

    if (!parentCategory) {
      return c.json(
        { success: false, error: "Parent category not found" },
        404,
      );
    }

    // Find the child category with matching slug and parentId
    const childCategory = await db.query.productCategory.findFirst({
      where: (cat, { and, eq }) =>
        and(eq(cat.slug, childSlug), eq(cat.parentId, parentCategory.id)),
    });

    if (!childCategory) {
      return c.json({ success: false, error: "Child category not found" }, 404);
    }

    // Get products only in this specific child category (not including its subcategories)
    const products = await db.query.product.findMany({
      where: (p, { eq }) => eq(p.categoryId, childCategory.id),
      with: {
        category: true,
      },
    });

    return c.json({
      success: true,
      parentCategory,
      childCategory,
      products,
    });
  })
  .get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    const category = await db.query.productCategory.findFirst({
      where: (cat, { eq }) => eq(cat.slug, slug),
    });
    return c.json({ success: true, category });
  })
  .get("/:slug/products", async (c) => {
    const slug = c.req.param("slug");

    // First, find the category by slug
    const category = await db.query.productCategory.findFirst({
      where: (cat, { eq }) => eq(cat.slug, slug),
    });

    if (!category) {
      return c.json({ success: false, error: "Category not found" }, 404);
    }

    // Find all products in this category (including subcategories)
    // First, get all subcategory IDs
    const subcategories = await db.query.productCategory.findMany({
      where: (cat, { eq }) => eq(cat.parentId, category.id),
    });

    const categoryIds = [category.id, ...subcategories.map((sc) => sc.id)];

    // Get products for all these category IDs
    const products = await db.query.product.findMany({
      where: (p, { inArray }) => inArray(p.categoryId, categoryIds),
      with: {
        category: true,
      },
    });

    return c.json({
      success: true,
      category,
      products,
    });
  });
