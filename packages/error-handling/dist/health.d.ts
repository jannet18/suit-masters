/**
 * Standardized health check routes for Hono services.
 *
 * Mount with `app.route("/health", createHealthRoutes({ service, checks }))`:
 *   - GET /health/liveness — always 200 while the process is accepting
 *     connections. Used for "is this instance alive" probes.
 *   - GET /health           — readiness: runs each check (e.g. a DB ping)
 *     and returns 503 if any of them fail. Used for "route traffic here"
 *     probes and load-balancer health checks.
 *
 * Each check is just `() => Promise<void>` that throws on failure, so a
 * service can wire in whatever it actually depends on (Postgres, Stripe,
 * Redis, ...) without this package needing to know about any of them.
 */
import { Hono } from "hono";
export type HealthCheck = () => Promise<void>;
export interface HealthRoutesOptions {
    service: string;
    checks?: Record<string, HealthCheck>;
}
export declare function createHealthRoutes({ service, checks, }: HealthRoutesOptions): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
//# sourceMappingURL=health.d.ts.map