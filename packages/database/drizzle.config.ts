import "dotenv/config";
import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: "../../.env" });
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
export default {
  schema: [
    "./src/schema/address.ts",
    "./src/schema/cart.ts",
    "./src/schema/idempotency.ts",
    "./src/schema/orders.ts",
    "./src/schema/payments.ts",
    "./src/schema/products.ts",
    "./src/schema/promotion.ts",
    "./src/schema/shared.ts",
    "./src/schema/user.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
