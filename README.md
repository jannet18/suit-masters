# Custom Suit Shop – Backend (MVP)

This backend supports a **custom suit e‑commerce flow** where users can:

1. View a customizable suit
2. Select customization options (fabric, fit, lapel, etc.)
3. Add the customized suit to a cart (with quantity support for events/weddings)
4. Checkout to create an order
5. View their order history

This is an **MVP focused on correctness and clarity**, not full production features like payments or fulfillment.

---

## 🧱 Tech Stack

- **Runtime:** Node.js
- **Framework:** Hono
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle
- **Auth:** Kinde (JWT-based)
- **Architecture:** Microservices (Turborepo)

---

## 🧠 Core Concepts

### Products vs Configurations

- **Product**: A base item (e.g. _Classic Navy Suit_)
- **Customization**: User-selected options (fabric, fit, lapel, etc.)
- **Product Configuration**: A saved snapshot of customization choices + final price

Configurations are **immutable** and safe to add to carts and orders.

### Cart Model

- One cart per user
- Cart items reference a configuration
- Quantity can be greater than 1 (e.g. weddings/events)

---

## 🔐 Authentication

- Users authenticate via **Kinde**
- Frontend sends a JWT access token
- Backend verifies JWT using Kinde JWKS
- Users are synced into the `site_users` table automatically

All protected endpoints require:

```
Authorization: Bearer <access_token>
```

---

## 📡 API Endpoints

### 1️⃣ Who Am I

**GET /me**

Returns the authenticated user.

Response:

```json
{
  "id": "uuid",
  "email": "user@email.com",
  "roles": "CUSTOMER"
}
```

---

### 2️⃣ Create Product Configuration

**POST /product-configurations**

Creates a saved customization snapshot.

Request:

```json
{
  "product_id": 12,
  "selected_options": {
    "fabric": 5,
    "fit": 2,
    "lapel": 7
  }
}
```

Response:

```json
{
  "configuration_id": "uuid",
  "final_price": 45000
}
```

---

### 3️⃣ Add Item to Cart

**POST /cart/items**

Adds a configuration to the user’s cart.

Request:

```json
{
  "product_item_id": 42,
  "configuration_id": "uuid",
  "qty": 5
}
```

---

### 4️⃣ Get Cart

**GET /cart**

Returns the current user’s cart.

Response:

```json
{
  "cart_id": 3,
  "items": [
    {
      "product": { "name": "Classic Navy Suit" },
      "configuration": { "fabric": "Italian Wool" },
      "qty": 5,
      "unit_price": 45000,
      "total_price": 225000
    }
  ],
  "cart_total": 225000
}
```

---

### 5️⃣ Checkout (Placeholder)

**POST /checkout**

Creates an order from the cart.

Response:

```json
{
  "order_id": 21,
  "total": 225000,
  "message": "Order created (payment pending)"
}
```

---

### 6️⃣ List Orders

**GET /orders**

Returns the user’s orders.

Response:

```json
[
  {
    "id": 21,
    "total": 225000,
    "order_date": "2026-02-07T14:22:10.123Z",
    "status": "PENDING_PAYMENT"
  }
]
```

---

## 🧪 API Testing (Before Frontend Wiring)

You can test all endpoints using **curl**, **Postman**, or **Hoppscotch**.

### 1️⃣ Set token

```bash
export TOKEN="<KINDE_ACCESS_TOKEN>"
```

---

### 2️⃣ Test auth

```bash
curl -H "Authorization: Bearer $TOKEN" \
http://localhost:4000/whoami
```

---

### 3️⃣ Create configuration

```bash
curl -X POST http://localhost:4000/product-configurations \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "product_id": 12,
  "selected_options": { "fabric": 5, "fit": 2 }
}'
```

---

### 4️⃣ Add to cart

```bash
curl -X POST http://localhost:4000/cart/items \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "product_item_id": 42,
  "configuration_id": "<UUID>",
  "qty": 3
}'
```

---

### 5️⃣ View cart

```bash
curl -H "Authorization: Bearer $TOKEN" \
http://localhost:4000/cart
```

---

### 6️⃣ Checkout

```bash
curl -X POST http://localhost:4000/checkout \
-H "Authorization: Bearer $TOKEN"
```

---

### 7️⃣ List orders

```bash
curl -H "Authorization: Bearer $TOKEN" \
http://localhost:4000/orders
```

---

## 🚧 Known Limitations (Intentional)

- No payment processing yet
- No order item breakdown
- No inventory deduction

These are **deliberate MVP decisions**.

---

## ✅ What This MVP Demonstrates

- Customizable product architecture
- Cart with group quantities
- Backend‑controlled pricing
- Stateless JWT authentication
- Clean separation of concerns

---

## 🔜 Next Step

After API testing is complete, proceed to **frontend wiring**:

- Call APIs in the correct order
- Display configuration summaries
- Show cart & orders

This backend is ready to be consumed by the frontend.
