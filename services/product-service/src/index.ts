import { serve } from "@hono/node-server";
import app from "./app.js";
import { cors } from "hono/cors";
import { MiddlewareHandler } from "hono";
import { getUser } from "@repo/auth";
const port = Number(process.env.PORT) || 4000;

app.use(
  "/api/*",
  getUser as MiddlewareHandler,
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
serve({
  fetch: app.fetch,
  port,
});

console.log(`Product Service is running on port ${port}`);
