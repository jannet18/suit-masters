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
export { createLogger, requestLogger, getRequestId, } from "./logging.js";
export { createHealthRoutes, } from "./health.js";
export { initSentry, isSentryEnabled, captureException, Sentry, } from "./sentry.js";
import { captureException as captureSentryException } from "./sentry.js";
import { getRequestId } from "./logging.js";
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
/**
 * Log an error to the console with structured formatting.
 * In production, this sends to your APM provider (Sentry, DataDog, etc.).
 */
export function reportError(report) {
    const prefix = `[${report.severity.toUpperCase()}][${report.service}]`;
    if (report.severity === ErrorSeverity.CRITICAL ||
        report.severity === ErrorSeverity.HIGH) {
        console.error(`${prefix} ${report.message}`, {
            path: report.path,
            method: report.method,
            userId: report.userId,
            timestamp: report.timestamp,
            stack: report.stack,
            metadata: report.metadata,
        });
    }
    else {
        console.warn(`${prefix} ${report.message}`, {
            path: report.path,
            timestamp: report.timestamp,
            metadata: report.metadata,
        });
    }
}
/**
 * Hono onError middleware for centralized error handling.
 * Catches all unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(err, c) {
    const service = process.env.SERVICE_NAME || "unknown";
    const url = c.req?.url || "unknown";
    const method = c.req?.method || "UNKNOWN";
    const requestId = getRequestId(c) || crypto.randomUUID();
    reportError({
        message: err.message,
        stack: err.stack,
        severity: ErrorSeverity.HIGH,
        service,
        path: url,
        method,
        timestamp: new Date().toISOString(),
        metadata: {
            statusCode: 500,
            requestId,
        },
    });
    captureSentryException(err, { requestId, path: url, method });
    return c.json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : err.message,
        requestId,
    }, 500);
}
/**
 * Create a not-found handler for 404 routes.
 */
export function notFoundHandler(c) {
    return c.json({
        error: "Not Found",
        message: `Route ${c.req.method} ${c.req.url} not found`,
    }, 404);
}
