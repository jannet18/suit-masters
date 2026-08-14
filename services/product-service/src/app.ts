import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { productsHandler } from "./routes/products.route.js";
import { getUser } from "@repo/auth";
import { configHandler, profileGetHandler, profilePutHandler } from "./routes/config.route.js";
import { collectionsHandler } from "./routes/collection.routes.js";
import { measurementsHandler } from "./routes/measurements.routes.js";
import { categoryRoutes } from "./routes/categories.routes.js";
import { promotionsHandler } from "./routes/promotions.routes.js";
import { usersHandler } from "./routes/users.route.js";
import { errorHandler, notFoundHandler } from "@repo/error-handling";

type Bindings = {
  DATABASE_URL: string;
};

type Variables = {
  user: {
    id: string;
    roles: string;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// --- 1. Global Middleware ---
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3002",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// --- 2. Public Routes ---
// Everyone can see the catalog and product details
app.route("/products", productsHandler);
app.route("/categories", categoryRoutes);
app.route("/collections", collectionsHandler);
// Measurement definitions (video guides) are public
app.route("/measurements", measurementsHandler);
// Promotions (public validate + admin CRUD)
app.route("/promotions", promotionsHandler);

// --- 3. Protected Routes ---
// Only logged-in users can save custom configurations or see private prices
app.use("/config/*", getUser);
app.route("/config", configHandler);
app.route("/config", profileGetHandler);
app.route("/config", profilePutHandler);
// Measurement profiles (user-specific data) require auth
app.use("/measurements/profiles*", getUser);

// Admin: user management
app.use("/users/*", getUser);
app.route("/users", usersHandler);

// --- 4. Health Check ---
app.get("/health", (c) => c.json({ status: "ok", service: "product-service" }));

// --- 5. Error Handling ---
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
