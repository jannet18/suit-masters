import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { auth } from "@repo/auth";
import { errorHandler, notFoundHandler } from "@repo/error-handling";

const app = new Hono();
const port = Number(process.env.PORT) || 4004;

app.use(
  "*",
  cors({
    origin: [
      "https://suit-masters.vercel.app",
      process.env.FRONTEND_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3002",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ status: "ok", service: "auth-service" }));

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.onError(errorHandler);
app.notFound(notFoundHandler);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Auth Service is running on port ${info.port}`);
  },
);
