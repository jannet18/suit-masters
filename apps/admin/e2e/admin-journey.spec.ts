import { expect, test, type Page } from "@playwright/test";
import { E2E_CATALOG, E2E_USERS, e2eQuery } from "@repo/testing/e2e";

/** Admin journey: sign in → create a product → approve a refund. */
test.describe.configure({ mode: "serial" });

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(E2E_USERS.admin.email);
  await page.getByLabel("Password").fill(E2E_USERS.admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

test("customers can't get into the dashboard", async ({ page }) => {
  await page.goto("/products");
  await expect(page).toHaveURL(/\/login\?redirect=%2Fproducts$/);

  await page.getByLabel("Email").fill(E2E_USERS.customer.email);
  await page.getByLabel("Password").fill(E2E_USERS.customer.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByText(/not an admin|admin access|not authorised|Access denied/i),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("create a product with a price typed in pounds", async ({ page }) => {
  await signIn(page);
  await page.goto("/products");
  // The page header's button (the sidebar has one too). Retry until React has
  // hydrated: a click on server-rendered markup before then does nothing.
  const form = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("button", { name: "Add Product" }).last().click();
    await expect(form).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await form.getByLabel("Name").fill("Charcoal Three-Piece");
  await expect(form.getByLabel("Slug")).toHaveValue("charcoal-three-piece");
  await form.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option", { name: "Suits" }).click();
  await form.getByRole("combobox", { name: "Fabric" }).click();
  await page.getByRole("option", { name: "Super 120s Wool" }).click();
  await form.getByLabel("Base price (£)").fill("649.99");
  await form.getByLabel("Initial stock").fill("4");
  await form.getByRole("button", { name: "Create product" }).click();
  await expect(form).toBeHidden();

  const row = page.getByRole("row", { name: /Charcoal Three-Piece/ });
  await expect(row).toContainText("£649.99");
  await expect(row).toContainText("4");

  const [stored] = await e2eQuery(
    "admin",
    `select p.base_price, i.stock from product p join product_item i on i.product_id = p.id
      where p.slug = 'charcoal-three-piece'`,
  );
  expect(stored).toEqual({ base_price: 64999, stock: 4 });
});

test("approve a refund: Stripe refunds the order total and stock returns", async ({
  page,
}) => {
  // A delivered, paid order for the customer with a refund request
  const [customer] = await e2eQuery(
    "admin",
    "select id from site_users where email = $1",
    [E2E_USERS.customer.email],
  );
  const [sku] = await e2eQuery(
    "admin",
    "update product_item set stock = stock - 1 where sku = 'E2E-NAVY' returning id, stock",
  );
  const [order] = await e2eQuery(
    "admin",
    `insert into shop_order (user_id, total, subtotal, status, currency, stripe_payment_intent_id,
       shipping_name, shipping_email, shipping_phone, shipping_address_line1, shipping_city,
       shipping_region, shipping_postal_code, shipping_country)
     values ($1, $2, $2, 'delivered', 'GBP', 'pi_3Fake0000000000000099999',
       'Ada Customer', $3, '07700900123', '1 Savile Row', 'London', '', 'W1S 3PR', 'United Kingdom')
     returning id`,
    [customer.id, E2E_CATALOG.suit.basePrice, E2E_USERS.customer.email],
  );
  await e2eQuery(
    "admin",
    `insert into order_items (order_id, product_id, product_item_id, product_name, unit_price, price_at_purchase, quantity)
     select $1, product_id, id, 'E2E Navy Suit', $2, $2, 1 from product_item where id = $3`,
    [order.id, E2E_CATALOG.suit.basePrice, sku.id],
  );
  const [refund] = await e2eQuery(
    "admin",
    `insert into refund_request (order_id, user_id, reason, refund_amount) values ($1, $2, 'wrong_size', $3) returning id`,
    [order.id, customer.id, E2E_CATALOG.suit.basePrice],
  );

  await signIn(page);
  await page.goto("/refunds");
  const card = page.getByRole("article", { name: `Refund #${refund.id}` });
  await expect(card).toContainText("£500.00");
  await card
    .getByPlaceholder("Add admin notes...")
    .fill("Wrong size, returned unworn");
  await card.getByRole("button", { name: "Approve" }).click();

  // Wait for the approval to land (the button reads "Processing..." meanwhile)
  await expect
    .poll(
      async () =>
        (
          await e2eQuery(
            "admin",
            "select status from refund_request where id = $1",
            [refund.id],
          )
        )[0].status,
    )
    .toBe("processing");
  await expect(
    card.getByRole("button", { name: "Mark as Completed" }),
  ).toBeVisible();
  const [stored] = await e2eQuery(
    "admin",
    "select stripe_refund_id from refund_request where id = $1",
    [refund.id],
  );
  expect(stored.stripe_refund_id).toMatch(/^re_3Fake/);
  const [after] = await e2eQuery(
    "admin",
    "select stock from product_item where id = $1",
    [sku.id],
  );
  expect(after.stock).toBe(sku.stock + 1);
});
