import type * as Sentry from "@sentry/nextjs";

const SENSITIVE_KEY_PATTERN =
  /pass(word)?|token|secret|authorization|jwt|card|cvv|cvc|ssn|ccnum|credit.?card/i;

/** Recursively redacts values whose key looks like a secret/PII field. */
function scrub<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value as object)) return value;
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => scrub(item, seen)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? "[Redacted]"
      : scrub(val, seen);
  }
  return result as T;
}

/**
 * Sentry `beforeSend` hook: strips anything that looks like a password,
 * token, card number, etc. before an event ever leaves the browser/server.
 */
export function scrubSentryEvent(
  event: Sentry.ErrorEvent,
  _hint: Sentry.EventHint,
): Sentry.ErrorEvent {
  if (event.request) event.request = scrub(event.request);
  if (event.extra) event.extra = scrub(event.extra);
  if (event.contexts) event.contexts = scrub(event.contexts);
  if (event.user) event.user = scrub(event.user);
  return event;
}
