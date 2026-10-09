import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR lets E2E runs use their own build dir alongside `next dev`
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // E2E builds skip the type check (CI runs `check-types` separately) so they
  // don't trip over a local dev server's generated .next/dev types
  typescript: { ignoreBuildErrors: process.env.NEXT_SKIP_TYPECHECK === "1" },
  // Minimal, self-contained server bundle for production Docker images
  output: "standalone",
  // Pin file tracing to the monorepo root rather than letting Next.js guess
  // from the nearest lockfile — a stray lockfile elsewhere on the host (or a
  // Docker layer) can otherwise point this at the wrong directory and break
  // the standalone output's path layout.
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default withSentryConfig(nextConfig, {
  // Only used for uploading source maps to Sentry; the app runs fine with
  // none of these set, it just won't have readable stack traces in Sentry.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
});
