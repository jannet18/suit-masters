# Testing

| Layer                             | Tool                          | Where                                                                                                          | Command            |
| --------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------ |
| Unit                              | Vitest                        | `packages/{pricing,validation,error-handling}/src/**/__tests__`, `services/order-service/src/domain/__tests__` | `npm test`         |
| Integration (HTTP, real Postgres) | Vitest + Hono `app.request()` | `services/*/test`                                                                                              | `npm test`         |
| End-to-end (browser)              | Playwright                    | `apps/frontend/e2e`, `apps/admin/e2e`                                                                          | `npm run test:e2e` |

## Prerequisites

Integration and E2E tests need a Postgres server (no data is touched on it:
each run creates its own database and drops it afterwards).

```sh
# Default: postgres://postgres@localhost:5432/postgres
export TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
# e.g. docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
```

For E2E, install the browser once: `npx playwright install chromium`.

## Running

```sh
npm test                                   # everything, via Turbo (cached per package)
npm test -w @repo/orders                   # one package
cd services/order-service && npx vitest    # watch mode
npx vitest                                 # all Vitest projects in one process (root config)

npm run test:e2e                           # both apps' journeys (production builds)
cd apps/frontend && npx playwright test --ui
E2E_NEXT_DEV=1 npx playwright test         # use `next dev` (faster, shows React dev warnings)
KEEP_TEST_DB=1 npm test -w @repo/orders    # keep the test database for inspection
```

## How it works (`packages/testing`)

- **Disposable databases** – Vitest's global setup creates
  `suit_test_<package>_<id>`, applies the Drizzle schema with `drizzle-kit
push`, and drops it when the run ends. Packages run in parallel without
  sharing state; files within a package run one at a time.
- **Fake Stripe API** – an in-process HTTP server implementing the calls we
  make (PaymentIntents, Refunds). Services' Stripe clients point at it via
  `STRIPE_API_HOST/PORT/PROTOCOL` (see `src/lib/stripe.ts`); in production
  these are unset. Tests can inspect `getFakeStripe().calls` or make the next
  refund fail with `failNextRefund()`.
- **Webhooks** – `signedStripeEvent()` builds a body and a valid
  `stripe-signature` header, exactly as Stripe does.
- **Fixtures** – `createUser("ADMIN")` (a real session; send `user.headers`),
  `createCatalog()`, `createPromotion()`. Everything uses unique slugs/codes.
- **E2E** – each app's Playwright config starts the fake Stripe API, the four
  services and the app on ports 5100–5302 against `suit_e2e_<app>`, seeded with
  a catalogue, a customer and an admin (`E2E_USERS`). All credentials are test
  values: `.env` files are overridden, so no real database, Stripe account or
  email provider is ever used. Card entry happens in Stripe's hosted iframe,
  so the journey confirms payment with a signed webhook, as Stripe does.

## Writing tests

- Test behaviour through the service's HTTP API (`app.request`) and assert on
  responses and database state; reach into the database only to arrange
  states the API can't create (e.g. "paid" without Stripe).
- Money is integer pence everywhere; assert exact integers.
- Prefer accessible selectors in E2E (`getByRole`, `getByLabel`). If an
  element can't be selected that way, fix its markup (labels, names) rather
  than adding a test id.
