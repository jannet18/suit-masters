import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/app/lib/sentry-scrubber";

// Runs for any edge runtime code. This app's own middleware.ts opts into the
// Node runtime (it needs a real DB connection for the session check), so
// this file is mostly here for completeness / future edge routes.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  debug: process.env.SENTRY_DEBUG === "1",
  beforeSend: scrubSentryEvent,
});
