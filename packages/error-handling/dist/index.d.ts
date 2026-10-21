/**
 * Centralized Error Tracking & Monitoring
 *
 * Provides a unified error handling middleware for all Hono-based services.
 * In production, this can be swapped to use Sentry, DataDog, or any APM provider.
 *
 * Usage:
 *   import { errorHandler, ErrorSeverity } from "@repo/error-handling";
 *   app.onError(errorHandler);
 */
export { createLogger, requestLogger, getRequestId, type Logger, } from "./logging.js";
export { createHealthRoutes, type HealthCheck, type HealthRoutesOptions, } from "./health.js";
export { initSentry, isSentryEnabled, captureException, Sentry, } from "./sentry.js";
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface ErrorReport {
    message: string;
    stack?: string;
    severity: ErrorSeverity;
    service: string;
    path?: string;
    method?: string;
    timestamp: string;
    userId?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Log an error to the console with structured formatting.
 * In production, this sends to your APM provider (Sentry, DataDog, etc.).
 */
export declare function reportError(report: ErrorReport): void;
/**
 * Hono onError middleware for centralized error handling.
 * Catches all unhandled errors and returns a consistent JSON response.
 */
export declare function errorHandler(err: Error, c: any): any;
/**
 * Create a not-found handler for 404 routes.
 */
export declare function notFoundHandler(c: any): any;
//# sourceMappingURL=index.d.ts.map