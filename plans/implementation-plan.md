# Suit Masters — Production Readiness Implementation Plan

## Overview

This plan breaks down the fixes into **5 phases** ordered by dependency and impact. Each phase contains specific file changes with line references from the audit.

---

## Phase 1: Critical Bug Fixes (Days 1-2)

These are bugs that will cause runtime failures or data corruption in production.

### 1.1 Fix Configurator Option IDs

**Problem:** [`Configurator.tsx:113-178`](../apps/frontend/app/components/Configurator.tsx:113) uses `Date.now() + N` for option IDs instead of real DB IDs. This means server-side validation in [`config.route.ts:37-44`](../services/product-service/src/routes/config.route.ts:37) will reject these options.

**Fix:** Map `fittingData` selections to actual `customizationGroups` from the fetched product data.

**Files to modify:**
- [`apps/frontend/app/components/Configurator.tsx`](../apps/frontend/app/components/Configurator.tsx)
  - Add a lookup map from product `customizationGroups` to convert selection labels → real option IDs
  - Replace `Date.now() + N` with actual option IDs from the product data
  - Ensure `selected_options` uses real DB IDs before calling `addToCart`

### 1.2 Consolidate Checkout Logic

**Problem:** Checkout logic exists in **both** [`cart-service/src/app.ts:270`](../services/cart-service/src/app.ts:270) (`POST /checkout`) and [`order-service/src/routes/orderRoutes.ts:332`](../services/order-service/src/routes/orderRoutes.ts:332) (`POST /orders`). The frontend calls `/api/orders` (which maps to order-service), but the cart-service also has a `/checkout` endpoint that does the same thing.

**Fix:** Remove checkout from cart-service. Order-service is the single source of truth.

**Files to modify:**
- [`services/cart-service/src/app.ts`](../services/cart-service/src/app.ts)
  - Remove the `POST /checkout` handler (lines 270-402)
  - Keep `POST /design/save`, `POST /add`, `GET /cart`
- [`apps/frontend/lib/api/api-client.ts`](../apps/frontend/lib/api/api-client.ts)
  - Fix `createOrder` (line 153) to POST to `/orders` not `/checkout`
  - Fix `getOrders` (line 139) to actually use the `token` parameter

### 1.3 Fix Cart Price Display Inconsistency

**Problem:** [`cart/page.tsx:71`](../apps/frontend/app/cart/page.tsx:71) divides by 100 (`base_price * quantity / 100`) but [`checkout/page.tsx:496`](../apps/frontend/app/checkout/page.tsx:496) uses `item.totalPrice` directly without dividing by 100.

**Fix:** Standardize on storing prices in cents (smallest unit) and always divide by 100 for display.

**Files to modify:**
- [`apps/frontend/app/checkout/page.tsx`](../apps/frontend/app/checkout/page.tsx)
  - Line 496: Change `item.totalPrice * item.quantity` to `(Number(item.base_price) * item.quantity) / 100`
  - Line 513: Ensure tax calculation uses the same base
- [`apps/frontend/app/stores/useCartStore.ts`](../apps/frontend/app/stores/useCartStore.ts)
  - Verify `getTotal()` (line 129-139) correctly divides by 100

### 1.4 Fix Account Page Order Fetching

**Problem:** [`account/page.tsx:48`](../apps/frontend/app/account/page.tsx:48) fetches directly from the order service URL instead of going through Next.js API routes. This exposes internal service URLs to the client.

**Fix:** Create a Next.js API route proxy and use it from the account page.

**Files to modify:**
- Create [`apps/frontend/app/api/orders/route.ts`](../apps/frontend/app/api/orders/route.ts) — proxy to order-service
- [`apps/frontend/app/account/page.tsx`](../apps/frontend/app/account/page.tsx)
  - Line 48: Change fetch URL to `/api/orders` instead of direct service URL

### 1.5 Fix Account Profile Save Button

**Problem:** [`account/page.tsx:482`](../apps/frontend/app/account/page.tsx:482) "Save Changes" button has no `onClick` or form handler — it's decorative.

**Fix:** Add form submission handler that POSTs to an API route.

**Files to modify:**
- [`apps/frontend/app/account/page.tsx`](../apps/frontend/app/account/page.tsx)
  - Add state management for profile fields
  - Add `handleSaveProfile` function
  - Wire up the Save Changes button

---

## Phase 2: Backend Service Hardening (Days 3-4)

### 2.1 Fix Product Config Missing User ID

**Problem:** [`config.route.ts:70`](../services/product-service/src/routes/config.route.ts:70) inserts `productConfiguration` without `kindeUserId`, so saved configurations aren't linked to users.

**Fix:** Add `kindeUserId: user.id` to the insert values.

**Files to modify:**
- [`services/product-service/src/routes/config.route.ts`](../services/product-service/src/routes/config.route.ts)
  - Line 69-75: Add `kindeUserId: user.id` to the insert

### 2.2 Fix Cart Service Dead Code & Join Issues

**Problem:** [`cart-service/src/app.ts:154-159`](../services/cart-service/src/app.ts:154) has unreachable code after a return statement. The `/cart` GET endpoint (line 236-237) uses `innerJoin` on `productItem` without null checks.

**Fix:** Remove dead code, add null-safe joins.

**Files to modify:**
- [`services/cart-service/src/app.ts`](../services/cart-service/src/app.ts)
  - Lines 154-159: Remove unreachable `c.json(cart)` return
  - Lines 236-237: Change `innerJoin` to `leftJoin` for `productItem`
  - Add null checks for configuration data

### 2.3 Update Stripe API Version

**Problem:** [`paymentRoutes.ts:99`](../services/payment-service/src/routes/paymentRoutes.ts:99) uses Stripe API version `"2022-11-15"` which is over 3 years old.

**Fix:** Update to latest stable API version.

**Files to modify:**
- [`services/payment-service/src/routes/paymentRoutes.ts`](../services/payment-service/src/routes/paymentRoutes.ts)
  - Line 99: Update `apiVersion` to `"2024-11-20.acacia"` or latest

### 2.4 Add Webhook Secret Validation

**Problem:** [`paymentRoutes.ts:155`](../services/payment-service/src/routes/paymentRoutes.ts:155) doesn't validate that `STRIPE_WEBHOOK_SECRET` is set before constructing the webhook event.

**Fix:** Add environment variable check with a clear error message.

**Files to modify:**
- [`services/payment-service/src/routes/paymentRoutes.ts`](../services/payment-service/src/routes/paymentRoutes.ts)
  - Add check: `if (!process.env.STRIPE_WEBHOOK_SECRET) return c.text('Webhook not configured', 500)`

### 2.5 Add Email Provider Integration

**Problem:** [`emailService.ts:66-71`](../services/order-service/src/services/emailService.ts:66) only logs emails in development. No actual sending.

**Fix:** Integrate Resend (or SendGrid) for production email delivery.

**Files to modify:**
- [`services/order-service/package.json`](../services/order-service/package.json)
  - Add `resend` dependency
- [`services/order-service/src/services/emailService.ts`](../services/order-service/src/services/emailService.ts)
  - Uncomment and configure Resend integration
  - Add `RESEND_API_KEY` env variable handling

---

## Phase 3: Frontend Feature Completion (Days 5-6)

### 3.1 Create Order Confirmation Page

**Problem:** Checkout redirects to `/order-confirmation?id=${orderId}` but this page doesn't exist.

**Fix:** Create the order confirmation page.

**Files to create:**
- [`apps/frontend/app/order-confirmation/page.tsx`](../apps/frontend/app/order-confirmation/page.tsx)
  - Fetch order by ID from API
  - Display order summary, shipping details, estimated delivery
  - "Continue Shopping" button

### 3.2 Add Shipping Calculation

**Problem:** [`checkout/page.tsx:509`](../apps/frontend/app/checkout/page.tsx:509) always shows £0.00 for shipping.

**Fix:** Implement shipping logic based on country/region.

**Files to modify:**
- [`apps/frontend/app/checkout/page.tsx`](../apps/frontend/app/checkout/page.tsx)
  - Add shipping calculation function (e.g., UK: £5, International: £15, Free over £200)
  - Display calculated shipping in summary
  - Include shipping in total

### 3.3 Make Tax Configurable

**Problem:** [`checkout/page.tsx:513`](../apps/frontend/app/checkout/page.tsx:513) hardcodes 20% VAT.

**Fix:** Make tax rate configurable by country.

**Files to modify:**
- [`apps/frontend/lib/utils.ts`](../apps/frontend/lib/utils.ts)
  - Add `getTaxRate(country: string): number` function
- [`apps/frontend/app/checkout/page.tsx`](../apps/frontend/app/checkout/page.tsx)
  - Use `getTaxRate(shippingData.country)` instead of hardcoded 0.2

### 3.4 Clean Up Cart Page

**Problem:** [`cart/page.tsx:116-256`](../apps/frontend/app/cart/page.tsx:116) has 140 lines of commented-out code.

**Fix:** Remove dead code, add hydration-aware loading state.

**Files to modify:**
- [`apps/frontend/app/cart/page.tsx`](../apps/frontend/app/cart/page.tsx)
  - Remove all commented-out code after line 115
  - Add hydration check from Zustand store
  - Add loading skeleton while cart hydrates

### 3.5 Add Measurement Profile Persistence

**Problem:** [`account/page.tsx:367-387`](../apps/frontend/app/account/page.tsx:367) "Saved Measurements" tab shows empty state with no save/load functionality.

**Fix:** Implement measurement profile CRUD.

**Files to modify:**
- [`apps/frontend/app/account/page.tsx`](../apps/frontend/app/account/page.tsx)
  - Add measurement form with all body measurement fields
  - Add save/load/delete functionality via API
- Create [`apps/frontend/app/api/measurements/route.ts`](../apps/frontend/app/api/measurements/route.ts)
  - Proxy to product-service `/measurements` endpoints

---

## Phase 4: Admin Dashboard Integration (Days 7-8)

### 4.1 Create Admin API Client

**Problem:** All admin pages use hardcoded mock data.

**Fix:** Create an API client and connect all pages to real data.

**Files to create:**
- [`apps/admin/lib/api-client.ts`](../apps/admin/lib/api-client.ts)
  - Functions for fetching products, users, orders, payments from backend services

**Files to modify:**
- [`apps/admin/app/products/page.tsx`](../apps/admin/app/products/page.tsx)
  - Replace hardcoded `getData()` with API calls
- [`apps/admin/app/users/page.tsx`](../apps/admin/app/users/page.tsx)
  - Replace hardcoded `getData()` with API calls
- [`apps/admin/app/payments/page.tsx`](../apps/admin/app/payments/page.tsx)
  - Replace hardcoded `getData()` with API calls

### 4.2 Add Admin Authentication Guard

**Problem:** [`admin/app/layout.tsx`](../apps/admin/app/layout.tsx) has no auth check.

**Fix:** Add middleware to verify admin role.

**Files to modify:**
- Create [`apps/admin/middleware.ts`](../apps/admin/middleware.ts)
  - Check for valid admin session/token
  - Redirect to login if unauthorized
- [`apps/admin/app/layout.tsx`](../apps/admin/app/layout.tsx)
  - Update metadata title to "Suit Masters Admin"

### 4.3 Add Order Management Pages

**Problem:** Admin has no order management UI.

**Files to create:**
- [`apps/admin/app/orders/page.tsx`](../apps/admin/app/orders/page.tsx)
  - Data table with all orders
  - Status filter, search, pagination
- [`apps/admin/app/orders/columns.tsx`](../apps/admin/app/orders/columns.tsx)
  - Order columns: ID, customer, total, status, date
- [`apps/admin/app/orders/[id]/page.tsx`](../apps/admin/app/orders/[id]/page.tsx)
  - Order detail view with items, shipping, status updates
  - Tailor assignment dropdown
  - Status update controls

---

## Phase 5: Database & Infrastructure (Days 9-10)

### 5.1 Apply Schema Migrations

**Problem:** Schema inconsistencies between Drizzle definitions and actual database.

**Files to execute:**
- [`plans/schema-updates.md`](../plans/schema-updates.md)
  - Run Phase 1 SQL: add timestamps, tailor notes, enhanced status enum
  - Run Phase 2 SQL: create structured customization tables
- [`packages/database/src/schema/index.ts`](../packages/database/src/schema/index.ts)
  - Update Drizzle schema to match new database structure

### 5.2 Add Centralized Error Tracking

**Files to modify:**
- All services: Add Sentry integration
- Frontend: Add error boundary with reporting

### 5.3 Add Health Check Monitoring

**Files to modify:**
- Create [`services/api-gateway/`](../services/api-gateway/) or add to existing
  - Centralized health check endpoint
  - Service status dashboard

---

## Execution Order & Dependencies

```
Phase 1 (Critical Bugs)
  ├── 1.1 Configurator IDs ← No dependencies
  ├── 1.2 Consolidate Checkout ← No dependencies
  ├── 1.3 Cart Price Display ← Depends on 1.2 (checkout logic)
  ├── 1.4 Account Orders ← No dependencies
  └── 1.5 Profile Save ← No dependencies

Phase 2 (Backend Hardening)
  ├── 2.1 Config User ID ← No dependencies
  ├── 2.2 Cart Service Fixes ← No dependencies
  ├── 2.3 Stripe API Version ← No dependencies
  ├── 2.4 Webhook Validation ← No dependencies
  └── 2.5 Email Provider ← No dependencies

Phase 3 (Frontend Features)
  ├── 3.1 Order Confirmation Page ← Depends on 1.2
  ├── 3.2 Shipping Calculation ← Depends on 1.3
  ├── 3.3 Tax Configuration ← No dependencies
  ├── 3.4 Cart Page Cleanup ← No dependencies
  └── 3.5 Measurement Profiles ← No dependencies

Phase 4 (Admin Dashboard)
  ├── 4.1 API Client ← No dependencies
  ├── 4.2 Auth Guard ← No dependencies
  └── 4.3 Order Management ← Depends on 4.1

Phase 5 (Database & Infra)
  ├── 5.1 Schema Migrations ← No dependencies
  ├── 5.2 Error Tracking ← No dependencies
  └── 5.3 Health Monitoring ← No dependencies
```

## Recommended Start: Phase 1

I recommend starting with **Phase 1** in this order:

1. **1.2 Consolidate Checkout** — Most impactful, removes duplicate logic and prevents data corruption
2. **1.1 Fix Configurator IDs** — Critical for custom suit orders to work
3. **1.3 Fix Cart Prices** — Ensures customers see correct prices
4. **1.4 Account Orders** — Quick fix, high user impact
5. **1.5 Profile Save** — Quick fix, good UX win

Shall I begin implementing Phase 1?
