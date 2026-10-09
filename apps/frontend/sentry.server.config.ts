import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-scrubber";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  // Only emits when SENTRY_DEBUG=1 is set; keeps normal server logs quiet.
  debug: process.env.SENTRY_DEBUG === "1",
  beforeSend: scrubSentryEvent,
});
