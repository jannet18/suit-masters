import { defineProject } from "vitest/config";

export default defineProject({
  test: { name: "pricing", environment: "node", include: ["src/**/*.test.ts"] },
});
