/**
 * Sentry wiring for Hono services. Entirely optional: with no SENTRY_DSN set
 * (the default until you create a Sentry project), every function here is a
 * no-op, so nothing breaks for services that haven't opted in yet.
 */
import * as Sentry from "@sentry/node";
export interface InitSentryOptions {
    serviceName: string;
    dsn?: string;
    environment?: string;
    tracesSampleRate?: number;
}
export declare function initSentry(opts: InitSentryOptions): void;
export declare function isSentryEnabled(): boolean;
export declare function captureException(err: unknown, context?: {
    requestId?: string;
    path?: string;
    method?: string;
    [key: string]: unknown;
}): void;
export { Sentry };
//# sourceMappingURL=sentry.d.ts.map