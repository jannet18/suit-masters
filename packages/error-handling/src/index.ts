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

// Avoid relying on Node.js type definitions in consumers of this package.
// Provide a minimal declaration for the subset of process.env we use.
declare const process: {
  env: {
    SERVICE_NAME?: string;
    NODE_ENV?: string;
    [key: string]: string | undefined;
  };
};

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
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
export function reportError(report: ErrorReport): void {
  const prefix = `[${report.severity.toUpperCase()}][${report.service}]`;

  if (report.severity === ErrorSeverity.CRITICAL || report.severity === ErrorSeverity.HIGH) {
    console.error(`${prefix} ${report.message}`, {
      path: report.path,
      method: report.method,
      userId: report.userId,
      timestamp: report.timestamp,
      stack: report.stack,
      metadata: report.metadata,
    });
  } else {
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
export function errorHandler(err: Error, c: any) {
  const service = process.env.SERVICE_NAME || "unknown";
  const url = c.req?.url || "unknown";
  const method = c.req?.method || "UNKNOWN";

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
    },
  });

  return c.json(
    {
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
      requestId: crypto.randomUUID(),
    },
    500,
  );
}

/**
 * Create a not-found handler for 404 routes.
 */
export function notFoundHandler(c: any) {
  return c.json(
    {
      error: "Not Found",
      message: `Route ${c.req.method} ${c.req.url} not found`,
    },
    404,
  );
}
