import { join } from "node:path";
import pg from "pg";
import { createTestDatabase, repoRoot } from "./database.js";
import { TEST_ENV } from "./env.js";
import { signedStripeEvent } from "./stripe-webhook.js";

/**
 * End-to-end environment: the four services, a fake Stripe API and the Next.js
 * app under test, all on dedicated ports against a dedicated database, so an
 * E2E run never touches your dev servers, real database, Stripe or email.
 */

export const E2E_PORTS = {
  product: 5100,
  order: 5101,
  payment: 5102,
  cart: 5103,
  stripe: 5110,
  frontend: 5300,
  admin: 5302,
} as const;

export type E2EApp = "frontend" | "admin";

const local = (port: number) => `http://localhost:${port}`;

export const E2E_USERS = {
  customer: {
    email: "e2e.customer@test.local",
    password: "Customer-Pass-123",
    name: "Ada Customer",
  },
  admin: {
    email: "e2e.admin@test.local",
    password: "Admin-Pass-123",
    name: "Grace Admin",
  },
} as const;

/** Deterministic catalogue the journeys run against. */
export const E2E_CATALOG = {
  categorySlug: "e2e-suits",
  suit: {
    slug: "e2e-navy-suit",
    name: "E2E Navy Suit",
    basePrice: 50000,
    stock: 3,
  },
  style: {
    name: "Style",
    options: [
      ["Single Breasted", 0],
      ["Double Breasted", 4500],
    ],
  },
  lapel: {
    name: "Lapel",
    options: [
      ["Notch Lapel", 0],
      ["Peak Lapel", 4000],
    ],
  },
} as const;

export function e2eDatabaseUrl(app: E2EApp): string {
  const url = new URL(
    process.env.TEST_DATABASE_URL ??
      "postgres://postgres@localhost:5432/postgres",
  );
  url.pathname = `/suit_e2e_${app}`;
  return url.toString();
}

/**
 * Env for every E2E process. Overrides everything the .env files set, so
 * no real credentials (database, Stripe, Resend) are ever used.
 */
export function e2eEnv(app: E2EApp): Record<string, string> {
  const appOrigin = local(E2E_PORTS[app]);
  // Next.js sets NODE_ENV itself for build/start; services default sensibly
  const { NODE_ENV: _nodeEnv, ...testEnv } = TEST_ENV;
  return {
    PATH: process.env.PATH ?? "",
    HOME: process.env.HOME ?? "",
    ...testEnv,
    DATABASE_URL: e2eDatabaseUrl(app),
    BETTER_AUTH_URL: appOrigin,
    NEXT_PUBLIC_AUTH_URL: appOrigin,
    BETTER_AUTH_TRUSTED_ORIGINS: appOrigin,
    FRONTEND_URL: local(E2E_PORTS.frontend),
    ADMIN_URL: local(E2E_PORTS.admin),
    STRIPE_API_HOST: "127.0.0.1",
    STRIPE_API_PORT: String(E2E_PORTS.stripe),
    STRIPE_API_PROTOCOL: "http",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fake",
    RESEND_API_KEY: "",
    PRODUCT_SERVICE_URL: local(E2E_PORTS.product),
    ORDER_SERVICE_URL: local(E2E_PORTS.order),
    PAYMENT_SERVICE_URL: local(E2E_PORTS.payment),
    CART_SERVICE_URL: local(E2E_PORTS.cart),
    NEXT_PUBLIC_PRODUCT_SERVICE_URL: local(E2E_PORTS.product),
    NEXT_PUBLIC_ORDER_SERVICE_URL: local(E2E_PORTS.order),
    NEXT_PUBLIC_PAYMENT_SERVICE_URL: local(E2E_PORTS.payment),
    NEXT_PUBLIC_CART_SERVICE_URL: local(E2E_PORTS.cart),
    NEXT_DIST_DIR: process.env.E2E_NEXT_DEV ? ".next-e2e-dev" : ".next-e2e",
    NEXT_TELEMETRY_DISABLED: "1",
    NEXT_SKIP_TYPECHECK: "1",
  };
}

type WebServer = {
  command: string;
  cwd: string;
  url: string;
  env: Record<string, string>;
  reuseExistingServer: boolean;
  timeout: number;
  stdout?: "pipe" | "ignore";
  stderr?: "pipe" | "ignore";
};

/** Playwright `webServer` entries: fake Stripe, the four services, then the app. */
export function e2eWebServers(app: E2EApp): WebServer[] {
  const root = repoRoot();
  const env = e2eEnv(app);
  const tsx = join(root, "node_modules/.bin/tsx");
  const next = join(root, "node_modules/.bin/next");
  const service = (dir: string, port: number): WebServer => ({
    command: `${tsx} src/index.ts`,
    cwd: join(root, "services", dir),
    url: `${local(port)}/health`,
    env: { ...env, PORT: String(port), SERVICE_NAME: dir },
    reuseExistingServer: false,
    timeout: 60_000,
  });
  return [
    {
      command: `${tsx} src/bin/fake-stripe.ts`,
      cwd: join(root, "packages/testing"),
      url: `http://127.0.0.1:${E2E_PORTS.stripe}/health`,
      env: { ...env, PORT: String(E2E_PORTS.stripe) },
      reuseExistingServer: false,
      timeout: 30_000,
    },
    service("product-service", E2E_PORTS.product),
    service("order-service", E2E_PORTS.order),
    service("payment-service", E2E_PORTS.payment),
    service("cart-service", E2E_PORTS.cart),
    {
      // Production build by default: pages are compiled up front, so timings
      // are stable. E2E_NEXT_DEV=1 uses `next dev` for faster local iteration.
      command: process.env.E2E_NEXT_DEV
        ? `${next} dev --port ${E2E_PORTS[app]}`
        : `${next} build && ${next} start --port ${E2E_PORTS[app]}`,
      cwd: join(root, "apps", app),
      url: local(E2E_PORTS[app]),
      env,
      reuseExistingServer: false,
      timeout: 600_000,
      stdout: "pipe",
    },
  ];
}

/**
 * Recreate the app's E2E database, apply the schema and seed the catalogue
 * and users. Called from each app's Playwright globalSetup.
 */
export async function prepareE2EDatabase(app: E2EApp) {
  Object.assign(process.env, e2eEnv(app));
  const name = new URL(e2eDatabaseUrl(app)).pathname.slice(1);
  await createTestDatabase(app, { name });

  // Imported only now, after DATABASE_URL points at the E2E database
  const {
    db,
    eq,
    usersTable,
    productCategory,
    fabric,
    product,
    productItem,
    customizationGroup,
    customizationOption,
  } = await import("@repo/db");
  const { auth } = await import("@repo/auth");

  for (const user of Object.values(E2E_USERS)) {
    await auth.api.signUpEmail({ body: user });
  }
  await db
    .update(usersTable)
    .set({ roles: "ADMIN" })
    .where(eq(usersTable.email, E2E_USERS.admin.email));

  const c = E2E_CATALOG;
  const [category] = await db
    .insert(productCategory)
    .values({ name: "Suits", slug: c.categorySlug })
    .returning();
  const [wool] = await db
    .insert(fabric)
    .values({ name: "Super 120s Wool", sku: "E2E-WOOL" })
    .returning();
  const [suit] = await db
    .insert(product)
    .values({
      name: c.suit.name,
      slug: c.suit.slug,
      categoryId: category!.id,
      fabricId: wool!.id,
      basePrice: c.suit.basePrice,
      productType: "CUSTOM",
      description: "A suit made for end-to-end tests.",
    })
    .returning();
  await db
    .insert(productItem)
    .values({
      productId: suit!.id,
      sku: "E2E-NAVY",
      price: c.suit.basePrice,
      stock: c.suit.stock,
    });
  for (const [order, group] of [c.style, c.lapel].entries()) {
    const [row] = await db
      .insert(customizationGroup)
      .values({
        categoryId: category!.id,
        name: group.name,
        displayOrder: order,
      })
      .returning();
    await db
      .insert(customizationOption)
      .values(
        group.options.map(([value, priceDelta]) => ({
          groupId: row!.id,
          name: value,
          value,
          priceDelta,
        })),
      );
  }
}

/** Run SQL against the app's E2E database (for assertions and setup in tests). */
export async function e2eQuery<T extends pg.QueryResultRow = any>(
  app: E2EApp,
  sql: string,
  params: unknown[] = [],
) {
  const client = new pg.Client({ connectionString: e2eDatabaseUrl(app) });
  await client.connect();
  try {
    return (await client.query<T>(sql, params)).rows;
  } finally {
    await client.end();
  }
}

/** Deliver a signed Stripe event to the payment service, as Stripe would. */
export async function sendStripeWebhook(
  type: string,
  object: Record<string, unknown>,
) {
  const { payload, signature } = signedStripeEvent(type, object);
  const res = await fetch(`${local(E2E_PORTS.payment)}/webhook`, {
    method: "POST",
    headers: {
      "stripe-signature": signature,
      "content-type": "application/json",
    },
    body: payload,
  });
  if (!res.ok)
    throw new Error(
      `Webhook ${type} failed: ${res.status} ${await res.text()}`,
    );
}
