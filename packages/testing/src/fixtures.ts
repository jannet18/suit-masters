import { randomUUID } from "node:crypto";
import {
  db,
  collection,
  customizationGroup,
  customizationOption,
  fabric,
  product,
  productCategory,
  productCollection,
  productItem,
  promotionCategory,
  promotionTable,
  session,
  usersTable,
} from "@repo/db";
import type { FakeStripe } from "./fake-stripe.js";

/**
 * Data builders for integration tests. Every builder uses unique slugs/codes,
 * so tests never collide even though they share one database per package.
 */

export const unique = (prefix = "t") => `${prefix}-${randomUUID().slice(0, 8)}`;

/** The fake Stripe started by @repo/testing/vitest/setup for this test file. */
export function getFakeStripe(): FakeStripe {
  const fake = (globalThis as { __fakeStripe?: FakeStripe }).__fakeStripe;
  if (!fake)
    throw new Error(
      "Fake Stripe not running: add @repo/testing/vitest/setup to setupFiles",
    );
  return fake;
}

export interface TestUser {
  id: string;
  email: string;
  token: string;
  /** Authorization header for app.request() */
  headers: Record<string, string>;
}

/** A user with a live session; authenticate with the returned bearer token. */
export async function createUser(
  role: "CUSTOMER" | "ADMIN" = "CUSTOMER",
): Promise<TestUser> {
  const email = `${unique(role.toLowerCase())}@test.local`;
  const [user] = await db
    .insert(usersTable)
    .values({ email, name: `Test ${role}`, roles: role, emailVerified: true })
    .returning();
  const token = randomUUID().replace(/-/g, "");
  await db.insert(session).values({
    userId: user!.id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return {
    id: user!.id,
    email,
    token,
    headers: { Authorization: `Bearer ${token}` },
  };
}

export interface TestCatalog {
  categoryId: number;
  fabricId: number;
  /** Stock-tracked suit, VAT-inclusive £500.00 */
  suit: { id: number; slug: string; basePrice: number; skuId: number };
  /** Made-to-order shirt in a second category, £50.00 */
  shirt: { id: number; slug: string; basePrice: number; categoryId: number };
  /** Customisation option values priced against the suit's category */
  options: { peakLapel: string; notchLapel: string; peakLapelDelta: number };
  collectionId: number;
}

export async function createCatalog(
  opts: { suitStock?: number } = {},
): Promise<TestCatalog> {
  const suffix = unique("c");
  const [suits] = await db
    .insert(productCategory)
    .values({ name: "Suits", slug: `suits-${suffix}` })
    .returning();
  const [shirts] = await db
    .insert(productCategory)
    .values({ name: "Shirts", slug: `shirts-${suffix}` })
    .returning();
  const [wool] = await db
    .insert(fabric)
    .values({ name: "Wool", sku: `W-${suffix}` })
    .returning();

  const [suit] = await db
    .insert(product)
    .values({
      name: "Navy Suit",
      slug: `navy-suit-${suffix}`,
      categoryId: suits!.id,
      fabricId: wool!.id,
      basePrice: 50000,
    })
    .returning();
  const [shirt] = await db
    .insert(product)
    .values({
      name: "Oxford Shirt",
      slug: `oxford-shirt-${suffix}`,
      categoryId: shirts!.id,
      fabricId: wool!.id,
      basePrice: 5000,
      productType: "STANDARD",
    })
    .returning();
  const [sku] = await db
    .insert(productItem)
    .values({
      productId: suit!.id,
      sku: `NAVY-${suffix}`.toUpperCase(),
      price: 50000,
      stock: opts.suitStock ?? 5,
    })
    .returning();

  const [lapels] = await db
    .insert(customizationGroup)
    .values({ categoryId: suits!.id, name: "Lapel" })
    .returning();
  await db.insert(customizationOption).values([
    {
      groupId: lapels!.id,
      name: "Peak lapel",
      value: `peak-${suffix}`,
      priceDelta: 4000,
    },
    {
      groupId: lapels!.id,
      name: "Notch lapel",
      value: `notch-${suffix}`,
      priceDelta: 0,
    },
  ]);

  const [col] = await db
    .insert(collection)
    .values({ name: "Wedding", slug: `wedding-${suffix}` })
    .returning();
  await db
    .insert(productCollection)
    .values({ product_id: suit!.id, collection_id: col!.id });

  return {
    categoryId: suits!.id,
    fabricId: wool!.id,
    suit: { id: suit!.id, slug: suit!.slug, basePrice: 50000, skuId: sku!.id },
    shirt: {
      id: shirt!.id,
      slug: shirt!.slug,
      basePrice: 5000,
      categoryId: shirts!.id,
    },
    options: {
      peakLapel: `peak-${suffix}`,
      notchLapel: `notch-${suffix}`,
      peakLapelDelta: 4000,
    },
    collectionId: col!.id,
  };
}

type PromotionSpec =
  | { type: "percentage"; percentOff: number; maxDiscountAmount?: number }
  | { type: "fixed_amount"; amountOff: number }
  | { type: "free_shipping" };

export async function createPromotion(
  spec: PromotionSpec & {
    minOrderAmount?: number;
    usageLimit?: number;
    categoryIds?: number[];
    expired?: boolean;
  },
) {
  const code = unique("promo").toUpperCase().replace(/-/g, "");
  const day = 24 * 60 * 60 * 1000;
  const [row] = await db
    .insert(promotionTable)
    .values({
      name: code,
      code,
      type: spec.type,
      percentOff: spec.type === "percentage" ? spec.percentOff : null,
      amountOff: spec.type === "fixed_amount" ? spec.amountOff : null,
      maxDiscountAmount:
        spec.type === "percentage" ? (spec.maxDiscountAmount ?? null) : null,
      minOrderAmount: spec.minOrderAmount ?? null,
      usageLimit: spec.usageLimit ?? null,
      perUserLimit: null,
      startDate: new Date(Date.now() - (spec.expired ? 10 : 1) * day),
      endDate: new Date(Date.now() + (spec.expired ? -1 : 1) * day),
    })
    .returning();
  if (spec.categoryIds?.length) {
    await db
      .insert(promotionCategory)
      .values(
        spec.categoryIds.map((categoryId) => ({
          promotionId: row!.id,
          categoryId,
        })),
      );
  }
  return row!;
}

export const UK_SHIPPING = {
  fullName: "Jo Smith",
  email: "jo@test.local",
  phone: "+44 7700 900000",
  address: "1 Savile Row",
  city: "London",
  postalCode: "W1S 3PR",
  country: "United Kingdom",
} as const;

/** JSON request init for Hono's app.request(). */
export function json(
  body: unknown,
  headers: Record<string, string> = {},
  method = "POST",
): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  };
}
