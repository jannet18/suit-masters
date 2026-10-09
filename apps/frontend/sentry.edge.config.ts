import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-scrubber";

// Runs for middleware and edge routes. Kept separate from
// sentry.server.config.ts because the edge runtime can't use every Node API.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  debug: process.env.SENTRY_DEBUG === "1",
  beforeSend: scrubSentryEvent,
});
