import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { productsHandler } from "./routes/productsRoute.js";
import { getUser } from "../../../packages/auth/src/middleware/authMiddleware.js";
import { configHandler } from "./routes/configRoute.js";
import { orderRoutes } from "../../order-service/src/routes/orderRoutes.js";
// import orderService from "../../order-service";
type Bindings = {
  DATABASE_URL: string;
  KINDE_DOMAIN: string;
  KINDE_CLIENT_ID: string;
};

type Variables = {
  user: {
    id: string;
    kinde_user_id: string;
    role: string;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// --- 1. Global Middleware ---
app.use("*", logger());
app.use("*", cors());

// --- 2. Public Routes ---
// Everyone can see the catalog and product details
app.route("/products", productsHandler);
// app.route("/order-service", orderService);
app.route("/orders", orderRoutes);

// --- 3. Protected Routes ---
// Only logged-in users can save custom configurations or see private prices
app.use("/config/*", getUser);
app.route("/config", configHandler);

// --- 4. Health Check ---
app.get("/health", (c) => c.json({ status: "ok", service: "product-service" }));

export default app;
