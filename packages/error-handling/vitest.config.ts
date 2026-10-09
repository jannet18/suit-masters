import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "error-handling",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
