import { Hono, type Context } from "hono";
import type { AuthEnv } from "@repo/auth";
import { db, productCategory, product, eq, sql } from "@repo/db";
import {
  createCategorySchema,
  updateCategorySchema,
  validateRequest,
} from "@repo/validation";
import {
  requireAdmin,
  parseId,
  readJson,
  pgErrorCode,
  PG_UNIQUE_VIOLATION,
  PG_FOREIGN_KEY_VIOLATION,
} from "./helpers.js";

// Admin category management. Mounted at /categories ahead of the public
// routes so /admin/all is not captured by GET /:parentSlug/:childSlug.
export const categoriesAdminHandler = new Hono<AuthEnv>();

/**
 * GET /categories/admin/all
 * All categories (including sub-categories) with product counts.
 */
categoriesAdminHandler.get("/admin/all", ...requireAdmin, async (c) => {
  const categories = await db
    .select({
      id: productCategory.id,
      name: productCategory.name,
      slug: productCategory.slug,
      parentId: productCategory.parentId,
      productCount: sql<number>`count(${product.id})::int`,
    })
    .from(productCategory)
    .leftJoin(product, eq(product.categoryId, productCategory.id))
    .groupBy(productCategory.id)
    .orderBy(productCategory.name);

  return c.json({ success: true, categories });
});

/** POST /categories */
categoriesAdminHandler.post("/", ...requireAdmin, async (c) => {
  const parsed = validateRequest(createCategorySchema, await readJson(c));
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);

  try {
    const [category] = await db
      .insert(productCategory)
      .values(parsed.data)
      .returning();
    return c.json({ success: true, category }, 201);
  } catch (error) {
    return categoryWriteError(c, error);
  }
});

/** PUT /categories/:id */
categoriesAdminHandler.put("/:id", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id) return c.json({ success: false, error: "Invalid category id" }, 400);

  const parsed = validateRequest(updateCategorySchema, await readJson(c));
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);
  if (parsed.data.parentId === id) {
    return c.json(
      { success: false, error: "A category cannot be its own parent" },
      400,
    );
  }

  try {
    const [category] = await db
      .update(productCategory)
      .set(parsed.data)
      .where(eq(productCategory.id, id))
      .returning();
    if (!category)
      return c.json({ success: false, error: "Category not found" }, 404);
    return c.json({ success: true, category });
  } catch (error) {
    return categoryWriteError(c, error);
  }
});

/**
 * DELETE /categories/:id
 * Sub-categories cascade. Refused while any product (in this category or a
 * sub-category) still uses it, so deleting a category never deletes products.
 */
categoriesAdminHandler.delete("/:id", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id) return c.json({ success: false, error: "Invalid category id" }, 400);

  try {
    const [category] = await db
      .delete(productCategory)
      .where(eq(productCategory.id, id))
      .returning({ id: productCategory.id });
    if (!category)
      return c.json({ success: false, error: "Category not found" }, 404);
    return c.json({ success: true, id });
  } catch (error) {
    if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
      return c.json(
        {
          success: false,
          error:
            "Category still has products or customisation groups; move them first",
        },
        409,
      );
    }
    throw error;
  }
});

function categoryWriteError(c: Context, error: unknown) {
  const code = pgErrorCode(error);
  if (code === PG_UNIQUE_VIOLATION) {
    return c.json(
      { success: false, error: "A category with this slug already exists" },
      409,
    );
  }
  if (code === PG_FOREIGN_KEY_VIOLATION) {
    return c.json(
      { success: false, error: "Parent category does not exist" },
      400,
    );
  }
  throw error;
}
