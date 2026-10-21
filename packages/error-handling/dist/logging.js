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
const REQUEST_ID_KEY = "requestId";
export function createLogger(serviceName) {
    const isProduction = process.env.NODE_ENV === "production";
    return pino({
        level: process.env.LOG_LEVEL || "info",
        base: { service: serviceName },
        timestamp: pino.stdTimeFunctions.isoTime,
        // Plain structured JSON in production (what log aggregators expect);
        // pino-pretty is a devDependency only, so it never ships in the
        // production image — this branch simply isn't reachable there.
        ...(isProduction
            ? {}
            : {
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        translateTime: "HH:MM:ss",
                        ignore: "pid,hostname",
                    },
                },
            }),
    });
}
/** Reads the correlation id a caller already set (gateway/proxy), or starts one. */
function resolveRequestId(c) {
    return (c.req.header("x-request-id") ||
        c.req.header("x-correlation-id") ||
        crypto.randomUUID());
}
export function getRequestId(c) {
    return c.get(REQUEST_ID_KEY);
}
/**
 * Per-request logging middleware. Mount once, near the top of the app:
 *   const logger = createLogger("cart-service");
 *   app.use(requestLogger(logger));
 */
export function requestLogger(logger) {
    return async (c, next) => {
        const requestId = resolveRequestId(c);
        c.set(REQUEST_ID_KEY, requestId);
        c.header("x-request-id", requestId);
        const start = Date.now();
        await next();
        const responseTime = Date.now() - start;
        const line = {
            requestId,
            path: c.req.path,
            method: c.req.method,
            statusCode: c.res.status,
            responseTime,
        };
        const message = `${c.req.method} ${c.req.path} ${c.res.status} ${responseTime}ms`;
        if (c.res.status >= 500) {
            logger.error(line, message);
        }
        else if (c.res.status >= 400) {
            logger.warn(line, message);
        }
        else {
            logger.info(line, message);
        }
    };
}
