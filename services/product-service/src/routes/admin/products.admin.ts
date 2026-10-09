import { Hono } from "hono";
import type { AuthEnv } from "@repo/auth";
import {
  db,
  product,
  productItem,
  productCategory,
  productCollection,
  collection,
  fabric,
  eq,
  and,
  desc,
  sql,
} from "@repo/db";
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
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

// Admin catalog management for products. Mounted at /products ahead of the
// public product routes so /admin/* is not captured by GET /:slug.
export const productsAdminHandler = new Hono<AuthEnv>();

function defaultSku(slug: string) {
  return `${slug}-default`.toUpperCase().slice(0, 64);
}

/**
 * GET /products/admin/all
 * Every product, including inactive ones, with category and stock summary.
 * `stock` is null for made-to-order products (no active SKUs).
 */
productsAdminHandler.get("/admin/all", ...requireAdmin, async (c) => {
  const rows = await db
    .select({
      id: product.id,
      name: product.name,
      slug: product.slug,
      productType: product.productType,
      basePrice: product.basePrice,
      description: product.description,
      mainImage: product.mainImage,
      productImage: product.productImage,
      isActive: product.isActive,
      categoryId: product.categoryId,
      categoryName: productCategory.name,
      fabricId: product.fabricId,
      skuCount: sql<number>`count(${productItem.id}) filter (where ${productItem.isActive})::int`,
      stock: sql<number>`coalesce(sum(${productItem.stock}) filter (where ${productItem.isActive}), 0)::int`,
    })
    .from(product)
    .innerJoin(productCategory, eq(product.categoryId, productCategory.id))
    .leftJoin(productItem, eq(productItem.productId, product.id))
    .groupBy(product.id, productCategory.name)
    .orderBy(desc(product.id));

  const products = rows.map(({ skuCount, stock, ...p }) => ({
    ...p,
    stock: skuCount > 0 ? stock : null,
  }));

  return c.json({ success: true, products });
});

/**
 * GET /products/admin/form-options
 * Categories, fabrics and collections for the admin product form.
 */
productsAdminHandler.get("/admin/form-options", ...requireAdmin, async (c) => {
  const [categories, fabrics, collections] = await Promise.all([
    db
      .select({
        id: productCategory.id,
        name: productCategory.name,
        parentId: productCategory.parentId,
      })
      .from(productCategory)
      .orderBy(productCategory.name),
    db
      .select({ id: fabric.id, name: fabric.name, sku: fabric.sku })
      .from(fabric)
      .where(eq(fabric.isActive, true))
      .orderBy(fabric.name),
    db
      .select({ id: collection.id, name: collection.name })
      .from(collection)
      .orderBy(collection.name),
  ]);

  return c.json({ success: true, categories, fabrics, collections });
});

/**
 * GET /products/admin/:id
 * One product with its SKUs and collection ids, for the edit form.
 */
productsAdminHandler.get("/admin/:id", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id) return c.json({ success: false, error: "Invalid product id" }, 400);

  const found = await db.query.product.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: { items: true, productCollections: true },
  });
  if (!found)
    return c.json({ success: false, error: "Product not found" }, 404);

  const { productCollections, ...rest } = found;
  return c.json({
    success: true,
    product: {
      ...rest,
      collectionIds: productCollections.map((pc) => pc.collection_id),
    },
  });
});

/**
 * POST /products
 * Create a product. `initialStock` creates a default SKU holding that stock;
 * without it the product is made to order.
 */
productsAdminHandler.post("/", ...requireAdmin, async (c) => {
  const parsed = validateRequest(createProductSchema, await readJson(c));
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);
  const { collectionIds, initialStock, ...fields } = parsed.data;

  try {
    const created = await db.transaction(async (tx) => {
      const [newProduct] = await tx.insert(product).values(fields).returning();
      if (!newProduct) throw new Error("Product insert returned no row");

      if (collectionIds?.length) {
        await tx.insert(productCollection).values(
          collectionIds.map((collectionId) => ({
            product_id: newProduct.id,
            collection_id: collectionId,
          })),
        );
      }

      if (initialStock !== undefined) {
        await tx.insert(productItem).values({
          productId: newProduct.id,
          sku: defaultSku(newProduct.slug),
          price: newProduct.basePrice,
          stock: initialStock,
        });
      }

      return newProduct;
    });

    return c.json({ success: true, product: created }, 201);
  } catch (error) {
    const code = pgErrorCode(error);
    if (code === PG_UNIQUE_VIOLATION) {
      return c.json(
        { success: false, error: "A product with this slug already exists" },
        409,
      );
    }
    if (code === PG_FOREIGN_KEY_VIOLATION) {
      return c.json(
        {
          success: false,
          error: "Category, fabric or collection does not exist",
        },
        400,
      );
    }
    throw error;
  }
});

/**
 * PATCH /products/:id
 * Update product fields. `collectionIds`, when given, replaces the product's
 * collection memberships.
 */
productsAdminHandler.patch("/:id", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id) return c.json({ success: false, error: "Invalid product id" }, 400);

  const parsed = validateRequest(updateProductSchema, await readJson(c));
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);
  const { collectionIds, ...fields } = parsed.data;

  try {
    const updated = await db.transaction(async (tx) => {
      const changes = fields;
      const [row] = Object.keys(changes).length
        ? await tx
            .update(product)
            .set(changes)
            .where(eq(product.id, id))
            .returning()
        : await tx.select().from(product).where(eq(product.id, id));
      if (!row) return null;

      if (collectionIds) {
        await tx
          .delete(productCollection)
          .where(eq(productCollection.product_id, id));
        if (collectionIds.length) {
          await tx
            .insert(productCollection)
            .values(
              collectionIds.map((collectionId) => ({
                product_id: id,
                collection_id: collectionId,
              })),
            );
        }
      }
      return row;
    });

    if (!updated)
      return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, product: updated });
  } catch (error) {
    const code = pgErrorCode(error);
    if (code === PG_UNIQUE_VIOLATION) {
      return c.json(
        { success: false, error: "A product with this slug already exists" },
        409,
      );
    }
    if (code === PG_FOREIGN_KEY_VIOLATION) {
      return c.json(
        {
          success: false,
          error: "Category, fabric or collection does not exist",
        },
        400,
      );
    }
    throw error;
  }
});

/**
 * DELETE /products/:id
 * Soft-deletes (deactivates) by default so order history stays intact.
 * `?hard=true` removes the row; SKUs, configurations, cart lines and
 * collection links cascade, and past order items keep their snapshots.
 */
productsAdminHandler.delete("/:id", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id) return c.json({ success: false, error: "Invalid product id" }, 400);

  if (c.req.query("hard") !== "true") {
    const [row] = await db
      .update(product)
      .set({ isActive: false })
      .where(eq(product.id, id))
      .returning({ id: product.id });
    if (!row)
      return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, deleted: "soft", id });
  }

  try {
    const [row] = await db
      .delete(product)
      .where(eq(product.id, id))
      .returning({ id: product.id });
    if (!row)
      return c.json({ success: false, error: "Product not found" }, 404);
    return c.json({ success: true, deleted: "hard", id });
  } catch (error) {
    if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
      return c.json(
        {
          success: false,
          error: "Product is still referenced elsewhere; deactivate it instead",
        },
        409,
      );
    }
    throw error;
  }
});

/**
 * PATCH /products/:id/stock
 * Manual stock adjustment. Body is either `{ stock }` (set absolute level) or
 * `{ delta }` (relative change), optionally with `productItemId` when the
 * product has several SKUs. Setting stock on a made-to-order product creates
 * its default SKU, which makes it stock-tracked from then on.
 */
productsAdminHandler.patch("/:id/stock", ...requireAdmin, async (c) => {
  const id = parseId(c);
  if (!id) return c.json({ success: false, error: "Invalid product id" }, 400);

  const parsed = validateRequest(updateStockSchema, await readJson(c));
  if (!parsed.success)
    return c.json({ success: false, errors: parsed.errors }, 400);
  const body = parsed.data;

  const result = await db.transaction(async (tx) => {
    const [target] = await tx.select().from(product).where(eq(product.id, id));
    if (!target) return { status: 404 as const, error: "Product not found" };

    const skus = await tx
      .select()
      .from(productItem)
      .where(
        body.productItemId
          ? and(
              eq(productItem.productId, id),
              eq(productItem.id, body.productItemId),
            )
          : eq(productItem.productId, id),
      )
      .for("update");

    if (body.productItemId && skus.length === 0) {
      return { status: 404 as const, error: "SKU not found for this product" };
    }
    if (skus.length > 1) {
      return {
        status: 400 as const,
        error: "Product has several SKUs; specify productItemId",
      };
    }

    const sku = skus[0];
    if (!sku) {
      if (!("stock" in body)) {
        return {
          status: 400 as const,
          error: "Product is made to order; set an absolute stock level first",
        };
      }
      const [createdSku] = await tx
        .insert(productItem)
        .values({
          productId: id,
          sku: defaultSku(target.slug),
          price: target.basePrice,
          stock: body.stock,
        })
        .returning();
      return { status: 200 as const, item: createdSku };
    }

    const nextStock = "stock" in body ? body.stock : sku.stock + body.delta;
    if (nextStock < 0) {
      return {
        status: 409 as const,
        error: `Adjustment would make stock negative (current: ${sku.stock})`,
      };
    }

    const [updatedSku] = await tx
      .update(productItem)
      .set({ stock: nextStock })
      .where(eq(productItem.id, sku.id))
      .returning();
    return { status: 200 as const, item: updatedSku };
  });

  if ("error" in result)
    return c.json({ success: false, error: result.error }, result.status);
  return c.json({ success: true, item: result.item });
});
