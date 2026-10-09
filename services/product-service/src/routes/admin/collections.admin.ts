import { Hono, type Context } from "hono";
import type { AuthEnv } from "@repo/auth";
import { db, collection, productCollection, eq, asc } from "@repo/db";
import {
  createCollectionSchema,
  updateCollectionSchema,
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

// Admin collection management. Mounted at /collections ahead of the public
// routes so /admin/all is not captured by GET /:slug/:productSlug.
export const collectionsAdminHandler = new Hono<AuthEnv>();

/**
 * GET /collections/admin/all
 * Every collection with the ids of its products.
 */
collectionsAdminHandler.get("/admin/all", ...requireAdmin, async (c) => {
  const rows = await db.query.collection.findMany({
    with: { products: true },
    orderBy: [asc(collection.sortOrder), asc(collection.id)],
  });

  const collections = rows.map(({ products, ...col }) => ({
    ...col,
    productIds: products.map((p) => p.product_id),
  }));

  return c.json({ success: true, collections });
});

/** POST /collections */
collectionsAdminHandler.post("/", ...requireAdmin, async (c) => {
  const parsed = validateRequest(createCollectionSchema, await readJson(c));
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);
  const { productIds, ...fields } = parsed.data;

  try {
    const created = await db.transaction(async (tx) => {
      const [row] = await tx.insert(collection).values(fields).returning();
      if (!row) throw new Error("Collection insert returned no row");
      if (productIds?.length) {
        await tx
          .insert(productCollection)
          .values(
            productIds.map((productId) => ({
              product_id: productId,
              collection_id: row.id,
            })),
          );
      }
      return row;
    });
    return c.json({ success: true, collection: created }, 201);
  } catch (error) {
    return collectionWriteError(c, error);
  }
});

/**
 * PUT /collections/:id
 * `productIds`, when given, replaces the collection's products.
 */
collectionsAdminHandler.put("/:id", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id)
    return c.json({ success: false, error: "Invalid collection id" }, 400);

  const parsed = validateRequest(updateCollectionSchema, await readJson(c));
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);
  const { productIds, ...fields } = parsed.data;

  try {
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(collection)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(collection.id, id))
        .returning();
      if (!row) return null;

      if (productIds) {
        await tx
          .delete(productCollection)
          .where(eq(productCollection.collection_id, id));
        if (productIds.length) {
          await tx
            .insert(productCollection)
            .values(
              productIds.map((productId) => ({
                product_id: productId,
                collection_id: id,
              })),
            );
        }
      }
      return row;
    });

    if (!updated)
      return c.json({ success: false, error: "Collection not found" }, 404);
    return c.json({ success: true, collection: updated });
  } catch (error) {
    return collectionWriteError(c, error);
  }
});

/**
 * DELETE /collections/:id
 * Product links cascade; the products themselves are untouched.
 */
collectionsAdminHandler.delete("/:id", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id)
    return c.json({ success: false, error: "Invalid collection id" }, 400);

  const [row] = await db
    .delete(collection)
    .where(eq(collection.id, id))
    .returning({ id: collection.id });
  if (!row)
    return c.json({ success: false, error: "Collection not found" }, 404);
  return c.json({ success: true, id });
});

function collectionWriteError(c: Context, error: unknown) {
  const code = pgErrorCode(error);
  if (code === PG_UNIQUE_VIOLATION) {
    return c.json(
      { success: false, error: "A collection with this slug already exists" },
      409,
    );
  }
  if (code === PG_FOREIGN_KEY_VIOLATION) {
    return c.json(
      { success: false, error: "One or more products do not exist" },
      400,
    );
  }
  throw error;
}
