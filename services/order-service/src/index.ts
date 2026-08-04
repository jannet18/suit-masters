import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { orderRoutes } from "./routes/orderRoutes.js";
import { refundRoutes } from "./routes/refundRoutes.js";
import { getUser } from "@repo/auth";
import { cors } from "hono/cors";
import { errorHandler, notFoundHandler } from "@repo/error-handling";

export const app = new Hono();

const port = Number(process.env.PORT) || 4001;

app.use(
  "/api/*",
  cors({
    origin: ["https://your-frontend.vercel.app", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ status: "order-service ok" }));
// orderRoutes.use("*", getUser as any);
app.route("/orders/*", orderRoutes);
app.route("/refunds", refundRoutes);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Order Service is running on port ${info.port}`);
  },
);
