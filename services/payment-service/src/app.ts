import { Context, Hono } from "hono";
import { paymentRoutes } from "./routes/paymentRoutes.js";
import { webhookRoutes } from "./routes/webhook.js";
import { cors } from "hono/cors";
import { db, sql } from "@repo/db";
import {
  errorHandler,
  notFoundHandler,
  createLogger,
  requestLogger,
  createHealthRoutes,
  initSentry,
} from "@repo/error-handling";

const SERVICE_NAME = "payment-service";
process.env.SERVICE_NAME ||= SERVICE_NAME;
initSentry({ serviceName: SERVICE_NAME });
const logger = createLogger(SERVICE_NAME);

const app = new Hono();
app.use(requestLogger(logger));

app.use(
  // "/api/*",
  "*",
  cors({
    origin: ["https://suit-masters.vercel.app", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

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

// app.get("/stripe-test", async (c) => {
//   const acct = await Stripe.accounts.retrieve(); // just to test
//   return c.json({ status: "ok", account: acct.id });
// });

app.route("/payments", paymentRoutes);
app.route("/webhook", webhookRoutes);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
