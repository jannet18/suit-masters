/**
 * Sentry wiring for Hono services. Entirely optional: with no SENTRY_DSN set
 * (the default until you create a Sentry project), every function here is a
 * no-op, so nothing breaks for services that haven't opted in yet.
 */
import * as Sentry from "@sentry/node";
const SENSITIVE_KEY_PATTERN = /pass(word)?|token|secret|authorization|jwt|card|cvv|cvc|ssn|ccnum|credit.?card/i;
let initialized = false;
export function initSentry(opts) {
    const dsn = opts.dsn ?? process.env.SENTRY_DSN;
    if (!dsn)
        return;
    Sentry.init({
        // dsn:"${dsn}",
        // debug: true,
        dsn,
        environment: opts.environment ?? process.env.NODE_ENV ?? "development",
        serverName: opts.serviceName,
        tracesSampleRate: opts.tracesSampleRate ??
            Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
        beforeSend(event) {
            return scrubEvent(event);
        },
    });
    initialized = true;
}
export function isSentryEnabled() {
    return initialized;
}
export function captureException(err, context) {
    if (!initialized)
        return;
    Sentry.captureException(err, (scope) => {
        if (context?.requestId)
            scope.setTag("requestId", context.requestId);
        if (context?.path)
            scope.setTag("path", context.path);
        if (context?.method)
            scope.setTag("method", context.method);
        scope.setExtras(scrubObject(context));
        return scope;
    });
}
/** Recursively redacts values whose key looks like a secret/PII field. */
function scrubObject(value, seen = new WeakSet()) {
    if (value === null || typeof value !== "object")
        return value;
    if (seen.has(value))
        return value;
    seen.add(value);
    if (Array.isArray(value)) {
        return value.map((item) => scrubObject(item, seen));
    }
    const result = {};
    for (const [key, val] of Object.entries(value)) {
        result[key] = SENSITIVE_KEY_PATTERN.test(key)
            ? "[Redacted]"
            : scrubObject(val, seen);
    }
    return result;
}
function scrubEvent(event) {
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
