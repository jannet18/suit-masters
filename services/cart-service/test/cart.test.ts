import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createCatalog,
  createUser,
  json,
  type TestCatalog,
  type TestUser,
} from "@repo/testing";
import { db, customizationOption, eq, shoppingCartItem } from "@repo/db";
import app from "../src/app.js";

let catalog: TestCatalog;
let otherCatalog: TestCatalog;
let shopper: TestUser;

beforeAll(async () => {
  [catalog, otherCatalog] = await Promise.all([
    createCatalog(),
    createCatalog(),
  ]);
});
beforeEach(async () => {
  shopper = await createUser(); // a fresh, empty bag per test
});

const getCart = async (user: TestUser) =>
  (await (await app.request("/cart", { headers: user.headers })).json()) as {
    items: Array<{
      id: number;
      qty: number;
      unit_price: number;
      total_price: number;
    }>;
    cart_total: number;
  };

const sync = (user: TestUser, items: unknown[]) =>
  app.request("/sync", json({ items }, user.headers));

describe("bag totals", () => {
  it("adds up several items and quantities in integer pence", async () => {
    await sync(shopper, [
      {
        id: catalog.suit.id,
        quantity: 2,
        product_type: "CUSTOM",
        selected_options: [{ label: catalog.options.peakLapel }],
      },
      { id: catalog.shirt.id, quantity: 3, product_type: "STANDARD" },
    ]);
    const cart = await getCart(shopper);
    const byPrice = cart.items
      .map((i) => [i.unit_price, i.qty, i.total_price])
      .sort();
    expect(byPrice).toEqual([
      [5000, 3, 15000],
      [54000, 2, 108000],
    ]);
    expect(cart.cart_total).toBe(123000);
  });

  it("an empty bag totals zero", async () => {
    const cart = await getCart(shopper);
    expect(cart).toMatchObject({ items: [], cart_total: 0 });
  });
});

describe("POST /sync reprices from the catalogue", () => {
  it("ignores prices sent by the client", async () => {
    await sync(shopper, [
      {
        id: catalog.suit.id,
        quantity: 1,
        product_type: "STANDARD",
        base_price: 1,
        totalPrice: 1,
      },
    ]);
    expect((await getCart(shopper)).cart_total).toBe(50000);
  });

  it("only prices options that belong to the product's category", async () => {
    // A peak lapel from a different category must not change this suit's price
    await sync(shopper, [
      {
        id: catalog.suit.id,
        quantity: 1,
        product_type: "CUSTOM",
        selected_options: [{ label: otherCatalog.options.peakLapel }],
      },
    ]);
    expect((await getCart(shopper)).cart_total).toBe(50000);
  });

  it("skips products that are gone or off sale, and clamps quantities", async () => {
    await sync(shopper, [
      { id: 999_999, quantity: 1, product_type: "STANDARD" },
      { id: catalog.shirt.id, quantity: 500, product_type: "STANDARD" },
    ]);
    const cart = await getCart(shopper);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.qty).toBe(10);
  });

  it("merges repeated standard items into one line", async () => {
    await sync(shopper, [
      { id: catalog.shirt.id, quantity: 1, product_type: "STANDARD" },
    ]);
    await sync(shopper, [
      { id: catalog.shirt.id, quantity: 2, product_type: "STANDARD" },
    ]);
    const cart = await getCart(shopper);
    expect(cart.items).toHaveLength(1);
    expect(cart.cart_total).toBe(15000);
  });
});

describe("POST /design/save", () => {
  async function optionId(value: string) {
    const [row] = await db
      .select()
      .from(customizationOption)
      .where(eq(customizationOption.value, value));
    return row!.id;
  }

  it("prices a saved design and adds it to the bag", async () => {
    const res = await app.request(
      "/design/save",
      json(
        {
          productId: catalog.suit.id,
          selections: { lapel: await optionId(catalog.options.peakLapel) },
        },
        shopper.headers,
      ),
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as any).finalPrice).toBe(54000);
    expect((await getCart(shopper)).cart_total).toBe(54000);
  });

  it("rejects options from another product's category", async () => {
    const res = await app.request(
      "/design/save",
      json(
        {
          productId: catalog.suit.id,
          selections: { lapel: await optionId(otherCatalog.options.peakLapel) },
        },
        shopper.headers,
      ),
    );
    expect(res.status).toBe(400);
  });

  it("rejects products that can't be customised", async () => {
    const res = await app.request(
      "/design/save",
      json({ productId: catalog.shirt.id, selections: {} }, shopper.headers),
    );
    expect(res.status).toBe(400);
  });
});

describe("editing the bag", () => {
  async function lineId(user: TestUser) {
    await sync(user, [
      { id: catalog.shirt.id, quantity: 1, product_type: "STANDARD" },
    ]);
    return (await getCart(user)).items[0]!.id;
  }

  it("updates quantity and removes lines", async () => {
    const id = await lineId(shopper);
    await app.request(
      `/update/${id}`,
      json({ quantity: 4 }, shopper.headers, "PUT"),
    );
    expect((await getCart(shopper)).cart_total).toBe(20000);
    await app.request(`/remove/${id}`, {
      method: "DELETE",
      headers: shopper.headers,
    });
    expect((await getCart(shopper)).items).toEqual([]);
  });

  it("rejects quantities below one", async () => {
    const id = await lineId(shopper);
    expect(
      (
        await app.request(
          `/update/${id}`,
          json({ quantity: 0 }, shopper.headers, "PUT"),
        )
      ).status,
    ).toBe(400);
  });

  it("can't touch another shopper's bag", async () => {
    const id = await lineId(shopper);
    const intruder = await createUser();
    await getCart(intruder); // creates the intruder's own empty bag
    expect(
      (
        await app.request(
          `/update/${id}`,
          json({ quantity: 9 }, intruder.headers, "PUT"),
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await app.request(`/remove/${id}`, {
          method: "DELETE",
          headers: intruder.headers,
        })
      ).status,
    ).toBe(404);
    const [line] = await db
      .select()
      .from(shoppingCartItem)
      .where(eq(shoppingCartItem.id, id));
    expect(line!.quantity).toBe(1);
  });

  it("requires sign-in", async () => {
    expect((await app.request("/cart")).status).toBe(401);
    expect((await app.request("/sync", json({ items: [] }))).status).toBe(401);
  });
});
