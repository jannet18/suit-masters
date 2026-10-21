/**
 * Structured JSON logging for Hono services.
 *
 * `createLogger` gives each service a pino instance tagged with its own
 * name; `requestLogger` is a Hono middleware that assigns (or forwards) a
 * correlation id for every request and logs one structured line per
 * response, so a single request can be traced across service boundaries by
 * grepping logs for its `requestId`.
 */
import pino from "pino";
import type { Context, MiddlewareHandler } from "hono";
export type Logger = pino.Logger;
export declare function createLogger(serviceName: string): Logger;
export declare function getRequestId(c: Context): string | undefined;
/**
 * Per-request logging middleware. Mount once, near the top of the app:
 *   const logger = createLogger("cart-service");
 *   app.use(requestLogger(logger));
 */
export declare function requestLogger(logger: Logger): MiddlewareHandler;
//# sourceMappingURL=logging.d.ts.map