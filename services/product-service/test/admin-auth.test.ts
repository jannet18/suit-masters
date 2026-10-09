import { beforeAll, describe, expect, it } from "vitest";
import {
  createCatalog,
  createUser,
  json,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import app from "../src/app.js";

/**
 * Every catalogue write route (and the admin read routes) must refuse
 * anonymous callers with 401 and signed-in customers with 403.
 */
let catalog: TestCatalog;
let customer: TestUser;
let admin: TestUser;

beforeAll(async () => {
  catalog = await createCatalog();
  [customer, admin] = await Promise.all([createUser(), createUser("ADMIN")]);
});

type Route = [method: string, path: () => string, body?: unknown];

const adminRoutes: Route[] = [
  ["GET", () => "/products/admin/all"],
  ["GET", () => "/products/admin/form-options"],
  ["GET", () => `/products/admin/${catalog.suit.id}`],
  ["POST", () => "/products", {}],
  ["PATCH", () => `/products/${catalog.suit.id}`, { name: "x" }],
  ["PATCH", () => `/products/${catalog.suit.id}/stock`, { delta: 1 }],
  ["DELETE", () => `/products/${catalog.suit.id}`],
  ["GET", () => "/categories/admin/all"],
  ["POST", () => "/categories", {}],
  ["PUT", () => `/categories/${catalog.categoryId}`, { name: "x" }],
  ["DELETE", () => `/categories/${catalog.categoryId}`],
  ["GET", () => "/collections/admin/all"],
  ["POST", () => "/collections", {}],
  ["PUT", () => `/collections/${catalog.collectionId}`, { name: "x" }],
  ["DELETE", () => `/collections/${catalog.collectionId}`],
  ["GET", () => "/promotions/all"],
  ["POST", () => "/promotions", {}],
  ["PUT", () => "/promotions/1", {}],
  ["DELETE", () => "/promotions/1"],
  ["GET", () => "/users"],
];

const send = (
  method: string,
  path: string,
  body: unknown,
  headers: Record<string, string>,
) =>
  app.request(
    path,
    body === undefined ? { method, headers } : json(body, headers, method),
  );

describe.each(adminRoutes)("%s %s", (method, path, body) => {
  it("401 without a session", async () => {
    expect((await send(method, path(), body, {})).status).toBe(401);
  });

  it("401 with an invalid or expired token", async () => {
    expect(
      (
        await send(method, path(), body, {
          Authorization: "Bearer not-a-real-token",
        })
      ).status,
    ).toBe(401);
  });

  it("403 for a signed-in customer", async () => {
    expect((await send(method, path(), body, customer.headers)).status).toBe(
      403,
    );
  });
});

describe("admins get through", () => {
  it("can list products, including stock", async () => {
    const res = await app.request("/products/admin/all", {
      headers: admin.headers,
    });
    expect(res.status).toBe(200);
    const { products } = (await res.json()) as {
      products: Array<{ id: number; stock: number | null }>;
    };
    expect(products.find((p) => p.id === catalog.suit.id)!.stock).toBe(5);
  });

  it("can create a product with a price in pence (and pounds are refused)", async () => {
    const product = {
      name: "Grey Suit",
      slug: `grey-${Date.now()}`,
      categoryId: catalog.categoryId,
      fabricId: catalog.fabricId,
    };
    const ok = await app.request(
      "/products",
      json({ ...product, basePrice: 64999, initialStock: 3 }, admin.headers),
    );
    expect(ok.status).toBe(201);
    expect(((await ok.json()) as any).product.basePrice).toBe(64999);

    const pounds = await app.request(
      "/products",
      json(
        { ...product, slug: `${product.slug}-b`, basePrice: 649.99 },
        admin.headers,
      ),
    );
    expect(pounds.status).toBe(400);
  });

  it("can adjust stock atomically and never below zero", async () => {
    const up = await app.request(
      `/products/${catalog.suit.id}/stock`,
      json({ delta: 3 }, admin.headers, "PATCH"),
    );
    expect(((await up.json()) as any).item.stock).toBe(8);
    const tooFar = await app.request(
      `/products/${catalog.suit.id}/stock`,
      json({ delta: -100 }, admin.headers, "PATCH"),
    );
    expect(tooFar.status).toBe(409);
  });

  it("soft-deleting hides a product from the public catalogue", async () => {
    const extra = await createCatalog();
    expect((await app.request(`/products/${extra.suit.slug}`)).status).toBe(
      200,
    );
    await app.request(`/products/${extra.suit.id}`, {
      method: "DELETE",
      headers: admin.headers,
    });
    expect((await app.request(`/products/${extra.suit.slug}`)).status).toBe(
      404,
    );
  });
});

describe("public catalogue stays open", () => {
  it("lists products with integer prices without a session", async () => {
    const res = await app.request("/products");
    expect(res.status).toBe(200);
    const { products } = (await res.json()) as {
      products: Array<{ base_price: number }>;
    };
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) expect(Number.isInteger(p.base_price)).toBe(true);
  });

  it("shows product detail with option prices in pence", async () => {
    const res = await app.request(`/products/${catalog.suit.slug}`);
    const { product } = (await res.json()) as any;
    expect(product.base_price).toBe(50000);
    expect(
      product.customizationGroups[0].options.map((o: any) => o.priceDelta),
    ).toEqual([4000, 0]);
  });
});
