var _a;
import { Hono } from "hono";
import { orderRoutes } from "./routes/orderRoutes.js";
import { refundRoutes } from "./routes/refundRoutes.js";
import { cors } from "hono/cors";
import { db, sql } from "@repo/db";
import { errorHandler, notFoundHandler, createLogger, requestLogger, createHealthRoutes, initSentry, } from "@repo/error-handling";
const SERVICE_NAME = "order-service";
(_a = process.env).SERVICE_NAME || (_a.SERVICE_NAME = SERVICE_NAME);
initSentry({ serviceName: SERVICE_NAME });
const logger = createLogger(SERVICE_NAME);
const app = new Hono();
app.use(requestLogger(logger));
// The storefront calls through its own /api proxy, but the admin dashboard
// calls this service directly from the browser with a Bearer token.
app.use("*", cors({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        process.env.ADMIN_URL || "http://localhost:3002",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
}));
app.route("/health", createHealthRoutes({
    service: SERVICE_NAME,
    checks: {
        database: async () => {
            await db.execute(sql `select 1`);
        },
    },
}));
app.route("/orders", orderRoutes);
app.route("/refunds", refundRoutes);
// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);
export default app;
