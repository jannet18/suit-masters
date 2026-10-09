import { expect, test, type Page } from "@playwright/test";
import {
  E2E_CATALOG,
  E2E_USERS,
  e2eQuery,
  sendStripeWebhook,
} from "@repo/testing/e2e";

/**
 * The core customer journey: browse → configure a bespoke suit → bag →
 * checkout → (Stripe confirms payment) → confirmation → save measurements.
 *
 * Card entry happens inside Stripe's hosted iframe, which can't load against
 * the fake Stripe API, so the test confirms payment the way Stripe itself
 * does: with a signed payment_intent.succeeded webhook.
 */
test.describe.configure({ mode: "serial" });

const { suit } = E2E_CATALOG;
// Base £500 + Double Breasted £45 + Peak Lapel £40
const CONFIGURED_PRICE = "£585.00";
const CONFIGURED_PENCE = 58500;

async function signIn(page: Page, redirect: string) {
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  await page.getByLabel("Email").fill(E2E_USERS.customer.email);
  await page.getByLabel("Password").fill(E2E_USERS.customer.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname === redirect);
}

async function fillShipping(page: Page) {
  await page.getByLabel("Full Name").fill("Ada Customer");
  await page.getByLabel("Phone").fill("+44 7700 900123");
  await page.getByLabel("Address").fill("1 Savile Row");
  await page.getByLabel("City").fill("London");
  await page.getByLabel("Postal Code").fill("W1S 3PR");
}

async function stock(): Promise<number> {
  const [row] = await e2eQuery(
    "frontend",
    "select stock from product_item where sku = 'E2E-NAVY'",
  );
  return row.stock;
}

/** React hydration problems (e.g. invalid nesting) seen during a test. */
function collectHydrationErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      msg.type() === "error" &&
      /hydrat|cannot be a descendant|cannot contain a nested/i.test(text)
    ) {
      errors.push(text.slice(0, 300));
    }
  });
  return errors;
}

test("browse, configure a suit, check out and pay", async ({ page }) => {
  const hydrationErrors = collectHydrationErrors(page);
  await signIn(page, `/shop/${E2E_CATALOG.categorySlug}`);

  // Browse the catalogue
  const card = page.getByRole("link", { name: new RegExp(suit.name) });
  await expect(card).toContainText("£500.00");
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/products/${suit.slug}$`));
  await page.getByRole("button", { name: "Design Now" }).click();
  await expect(page).toHaveURL(new RegExp(`/products/${suit.slug}/configure$`));

  // Step 1: style
  await page.getByRole("button", { name: /^Double Breasted/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  // Step 2: fabric (this product has no fabric options)
  await page.getByRole("button", { name: "Continue" }).click();
  // Step 3: details
  await page.getByRole("button", { name: /^Peak Lapel/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  // Step 4: measurements
  for (const [label, value] of [
    ["Height", "182"],
    ["Chest", "101"],
    ["Waist", "86"],
    ["Seat", "99"],
    ["Shoulder Width", "47"],
    ["Inseam", "83"],
  ]) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByRole("button", { name: "Continue" }).click();
  // Step 5: summary
  await expect(page.getByText(CONFIGURED_PRICE).first()).toBeVisible();
  await page.getByRole("button", { name: "Add to Cart" }).click();

  // Bag
  await expect(page).toHaveURL(/\/cart$/);
  await expect(
    page.getByRole("heading", { name: "Shopping Cart" }),
  ).toBeVisible();
  await expect(page.getByText(`Bespoke ${suit.name}`)).toBeVisible();
  await page.getByRole("button", { name: /Proceed to Checkout/ }).click();

  // Checkout: the total shown comes from the server quote
  await expect(page).toHaveURL(/\/checkout$/);
  await fillShipping(page);
  await expect(page.getByText(CONFIGURED_PRICE).last()).toBeVisible();
  await expect(page.getByText("Includes £97.50 VAT")).toBeVisible();
  const stockBefore = await stock();
  await page.getByRole("button", { name: "Continue to Payment" }).click();
  await expect(
    page.getByRole("heading", { name: "Payment Method" }),
  ).toBeVisible();

  // The order exists, priced by the server, and its stock is reserved
  const [order] = await e2eQuery(
    "frontend",
    `select o.id, o.status, o.total, o.stripe_payment_intent_id, i.measurement_snapshot
       from shop_order o join order_items i on i.order_id = o.id
      order by o.id desc limit 1`,
  );
  expect(order).toMatchObject({ status: "pending", total: CONFIGURED_PENCE });
  expect(order.stripe_payment_intent_id).toMatch(/^pi_3Fake/);
  expect(order.measurement_snapshot).toMatchObject({ chest: 101, waist: 86 });
  expect(await stock()).toBe(stockBefore - 1);

  // Stripe confirms the payment
  await sendStripeWebhook("payment_intent.succeeded", {
    id: order.stripe_payment_intent_id,
    object: "payment_intent",
    amount: CONFIGURED_PENCE,
    amount_received: CONFIGURED_PENCE,
    currency: "gbp",
    metadata: { orderId: String(order.id) },
  });
  await expect
    .poll(
      async () =>
        (
          await e2eQuery(
            "frontend",
            "select status from shop_order where id = $1",
            [order.id],
          )
        )[0].status,
    )
    .toBe("paid");

  // Stripe redirects the shopper to the confirmation page
  await page.goto(`/order-confirmation?id=${order.id}`);
  await expect(
    page.getByRole("heading", { name: "Order Confirmed!" }),
  ).toBeVisible();
  await expect(page.getByText(CONFIGURED_PRICE).first()).toBeVisible();

  // The bag was emptied
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Your cart is empty" }),
  ).toBeVisible();

  expect(hydrationErrors).toEqual([]);
});

test("save a measurement profile", async ({ page }) => {
  await signIn(page, "/account");
  await page
    .getByRole("button", { name: "Saved Measurements" })
    .first()
    .click();
  await page.getByRole("button", { name: "+ New Profile" }).click();

  await page.getByLabel("Profile Name").fill("Wedding fitting");
  for (const [label, value] of [
    ["Height", "182"],
    ["Chest", "101"],
    ["Waist", "86"],
    ["Hips", "99"],
    ["Inseam", "83"],
    ["Shoulder Width", "47"],
  ]) {
    await page.getByLabel(new RegExp(`^${label} \\(cm\\)$`)).fill(value);
  }
  await page.getByRole("button", { name: "Save Profile" }).click();

  await expect(page.getByText("Wedding fitting")).toBeVisible();
  const [profile] = await e2eQuery(
    "frontend",
    "select chest, waist from user_measurements where profile_name = 'Wedding fitting'",
  );
  expect(profile).toEqual({ chest: "101.00", waist: "86.00" });
});

test("checkout is blocked when the suit is out of stock", async ({ page }) => {
  await e2eQuery(
    "frontend",
    "update product_item set stock = 0 where sku = 'E2E-NAVY'",
  );
  try {
    await signIn(page, `/products/${suit.slug}/configure`);
    for (let step = 0; step < 4; step++)
      await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await page.getByRole("button", { name: /Proceed to Checkout/ }).click();

    await fillShipping(page);
    await page.getByRole("button", { name: "Continue to Payment" }).click();

    // (Next.js also renders an empty role="alert" route announcer)
    await expect(
      page.getByRole("alert").filter({ hasText: "Out of stock" }),
    ).toContainText(`Out of stock: ${suit.name}`);
    await expect(
      page.getByRole("heading", { name: "Payment Method" }),
    ).toBeHidden();
  } finally {
    await e2eQuery(
      "frontend",
      "update product_item set stock = $1 where sku = 'E2E-NAVY'",
      [E2E_CATALOG.suit.stock],
    );
  }
});
