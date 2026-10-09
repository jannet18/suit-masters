import { Hono } from "hono";
import { cors } from "hono/cors";
import { db, sql } from "@repo/db";
import { productsHandler } from "./routes/products.route.js";
import { getUser, type AuthEnv } from "@repo/auth";
import {
  configHandler,
  profileGetHandler,
  profilePutHandler,
} from "./routes/config.route.js";
import { collectionsHandler } from "./routes/collection.routes.js";
import { measurementsHandler } from "./routes/measurements.routes.js";
import { categoryRoutes } from "./routes/categories.routes.js";
import { promotionsHandler } from "./routes/promotions.routes.js";
import { usersHandler } from "./routes/users.routes.js";
import {
  errorHandler,
  notFoundHandler,
  createLogger,
  requestLogger,
  createHealthRoutes,
  initSentry,
} from "@repo/error-handling";
import { productsAdminHandler } from "./routes/admin/products.admin.js";
import { categoriesAdminHandler } from "./routes/admin/categories.admin.js";
import { collectionsAdminHandler } from "./routes/admin/collections.admin.js";

const SERVICE_NAME = "product-service";
process.env.SERVICE_NAME ||= SERVICE_NAME;
initSentry({ serviceName: SERVICE_NAME });
const logger = createLogger(SERVICE_NAME);

const app = new Hono<AuthEnv>();

// --- 1. Global Middleware ---
app.use("*", requestLogger(logger));
app.use("*", cors());

// --- 2. Admin Catalog Routes ---
// Mounted before the public routers so /admin/* paths are not captured by
// public slug routes. Each route enforces ADMIN itself; public GETs on the
// same prefixes stay open.
app.route("/products", productsAdminHandler);
app.route("/categories", categoriesAdminHandler);
app.route("/collections", collectionsAdminHandler);

// --- 3. Public Routes ---
// Everyone can see the catalog and product details
app.route("/products", productsHandler);
app.route("/categories", categoryRoutes);
app.route("/collections", collectionsHandler);
// Measurement definitions (video guides) are public; profiles need a user.
// The middleware must be registered before the route or it never runs, and
// Hono's "*" only matches whole segments, hence the two patterns.
app.use("/measurements/profiles", getUser);
app.use("/measurements/profiles/*", getUser);
app.route("/measurements", measurementsHandler);
// Promotions (public validate + admin CRUD)
app.route("/promotions", promotionsHandler);
// Users (admin-only listing; auth enforced inside the handler)
app.route("/users", usersHandler);

// --- 4. Protected Routes ---
// Only logged-in users can save custom configurations or see private prices
app.use("/config/*", getUser);
app.route("/config", configHandler);
app.route("/config", profileGetHandler);
app.route("/config", profilePutHandler);

// --- 5. Health Check ---
app.route(
  "/health",
  createHealthRoutes({
    service: SERVICE_NAME,
    checks: {
      database: async () => {
        await db.execute(sql`select 1`);
      },
    },
  }),
);

// --- 6. Error Handling ---
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
