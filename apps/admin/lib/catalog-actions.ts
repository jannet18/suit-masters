"use server";

import { revalidatePath } from "next/cache";
import {
  adminApi,
  type CategoryInput,
  type CollectionInput,
  type ProductInput,
  type StockInput,
} from "./api-client";
import { getSessionToken } from "./getSessionToken";

// Server actions for catalog forms. They run on the server so the admin's
// session token is forwarded to product-service without reaching the browser.

export async function getProductFormOptions() {
  return adminApi.getProductFormOptions(await getSessionToken());
}

export async function getProduct(id: number) {
  return adminApi.getProduct(id, await getSessionToken());
}

export async function createProduct(data: ProductInput) {
  const result = await adminApi.createProduct(data, await getSessionToken());
  if (result.success) revalidatePath("/products");
  return result;
}

export async function updateProduct(id: number, data: Partial<ProductInput>) {
  const { initialStock: _ignored, ...changes } = data;
  const result = await adminApi.updateProduct(
    id,
    changes,
    await getSessionToken(),
  );
  if (result.success) revalidatePath("/products");
  return result;
}

export async function deleteProducts(ids: number[], { hard = false } = {}) {
  const token = await getSessionToken();
  const results = await Promise.all(
    ids.map((id) => adminApi.deleteProduct(id, { hard }, token)),
  );
  revalidatePath("/products");
  const failed = results.flatMap((r) => (r.success ? [] : [r.error]));
  return failed.length
    ? { success: false as const, error: failed.join("; ") }
    : { success: true as const };
}

export async function updateStock(id: number, stock: StockInput) {
  const result = await adminApi.updateStock(id, stock, await getSessionToken());
  if (result.success) revalidatePath("/products");
  return result;
}

export async function getCategories() {
  return adminApi.getCategories(await getSessionToken());
}

export async function createCategory(data: CategoryInput) {
  const result = await adminApi.createCategory(data, await getSessionToken());
  if (result.success) revalidatePath("/categories");
  return result;
}

export async function updateCategory(id: number, data: Partial<CategoryInput>) {
  const result = await adminApi.updateCategory(
    id,
    data,
    await getSessionToken(),
  );
  if (result.success) revalidatePath("/categories");
  return result;
}

export async function deleteCategory(id: number) {
  const result = await adminApi.deleteCategory(id, await getSessionToken());
  if (result.success) revalidatePath("/categories");
  return result;
}

export async function getCatalogProducts() {
  return adminApi.getCatalogProducts(await getSessionToken());
}

export async function createCollection(data: CollectionInput) {
  const result = await adminApi.createCollection(data, await getSessionToken());
  if (result.success) revalidatePath("/collections");
  return result;
}

export async function updateCollection(
  id: number,
  data: Partial<CollectionInput>,
) {
  const result = await adminApi.updateCollection(
    id,
    data,
    await getSessionToken(),
  );
  if (result.success) revalidatePath("/collections");
  return result;
}

export async function deleteCollection(id: number) {
  const result = await adminApi.deleteCollection(id, await getSessionToken());
  if (result.success) revalidatePath("/collections");
  return result;
}
