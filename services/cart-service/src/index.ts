import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number(process.env.PORT) || 10000;

console.log(`🛒 Cart Service starting on port ${port}`);

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`✅ Cart Service is listening at http://0.0.0.0:${info.port}`);
  },
);
