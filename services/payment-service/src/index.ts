import { serve } from "@hono/node-server";
import app from "./app.js";
import { startReservationSweeper } from "./jobs/expireReservations.js";

const port = Number(process.env.PORT) || 4002;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Payment Service is running on port ${info.port}`);
    startReservationSweeper();
  },
);
