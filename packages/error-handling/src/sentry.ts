/**
 * Sentry wiring for Hono services. Entirely optional: with no SENTRY_DSN set
 * (the default until you create a Sentry project), every function here is a
 * no-op, so nothing breaks for services that haven't opted in yet.
 */
import * as Sentry from "@sentry/node";

const SENSITIVE_KEY_PATTERN =
  /pass(word)?|token|secret|authorization|jwt|card|cvv|cvc|ssn|ccnum|credit.?card/i;

let initialized = false;

export interface InitSentryOptions {
  serviceName: string;
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
}

export function initSentry(opts: InitSentryOptions): void {
  const dsn = opts.dsn ?? process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    // dsn:"${dsn}",
    // debug: true,
    dsn,
    environment: opts.environment ?? process.env.NODE_ENV ?? "development",
    serverName: opts.serviceName,
    tracesSampleRate:
      opts.tracesSampleRate ??
      Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    beforeSend(event) {
      return scrubEvent(event);
    },
  });

  initialized = true;
}

export function isSentryEnabled(): boolean {
  return initialized;
}

export function captureException(
  err: unknown,
  context?: {
    requestId?: string;
    path?: string;
    method?: string;
    [key: string]: unknown;
  },
): void {
  if (!initialized) return;

  Sentry.captureException(err, (scope) => {
    if (context?.requestId) scope.setTag("requestId", context.requestId);
    if (context?.path) scope.setTag("path", context.path);
    if (context?.method) scope.setTag("method", context.method);
    scope.setExtras(scrubObject(context) as Record<string, unknown>);
    return scope;
  });
}

/** Recursively redacts values whose key looks like a secret/PII field. */
function scrubObject<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value as object)) return value;
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => scrubObject(item, seen)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? "[Redacted]"
      : scrubObject(val, seen);
  }
  return result as T;
}

function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  if (event.request) {
    event.request = scrubObject(event.request);
  }
  if (event.extra) {
    event.extra = scrubObject(event.extra);
  }
  if (event.contexts) {
    event.contexts = scrubObject(event.contexts);
  }
  return event;
}

export { Sentry };
