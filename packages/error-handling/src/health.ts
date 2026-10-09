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

export function createHealthRoutes({
  service,
  checks = {},
}: HealthRoutesOptions) {
  const health = new Hono();

  health.get("/liveness", (c) => c.json({ status: "ok" }));

  health.get("/", async (c) => {
    const results: Record<string, "up" | "down"> = {};
    let allHealthy = true;

    await Promise.all(
      Object.entries(checks).map(async ([name, check]) => {
        try {
          await check();
          results[name] = "up";
        } catch (error) {
          results[name] = "down";
          allHealthy = false;
          console.error(`[health] ${service}: check "${name}" failed`, error);
        }
      }),
    );

    return c.json(
      {
        status: allHealthy ? "healthy" : "unhealthy",
        service,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        checks: results,
      },
      // 503 Service Unavailable is the standard status for a failed
      // readiness probe (load balancers / k8s both key off this).
      allHealthy ? 200 : 503,
    );
  });

  return health;
}
