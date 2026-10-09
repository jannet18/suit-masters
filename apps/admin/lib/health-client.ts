export interface ServiceHealthTarget {
  name: string;
  baseUrl?: string;
}

export const SERVICE_HEALTH_TARGETS: ServiceHealthTarget[] = [
  {
    name: "product-service",
    baseUrl: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  },
  { name: "cart-service", baseUrl: process.env.NEXT_PUBLIC_CART_SERVICE_URL },
  { name: "order-service", baseUrl: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL },
  {
    name: "payment-service",
    baseUrl: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
  },
];

export interface ServiceHealthResult {
  name: string;
  state: "up" | "down" | "unreachable" | "unconfigured";
  latencyMs: number | null;
  checks?: Record<string, "up" | "down">;
  uptimeSeconds?: number;
  error?: string;
  checkedAt: string;
}

/** Hits a service's /health with a timeout; never throws. */
export async function checkServiceHealth(
  target: ServiceHealthTarget,
  timeoutMs = 5000,
): Promise<ServiceHealthResult> {
  const checkedAt = new Date().toISOString();

  if (!target.baseUrl) {
    return {
      name: target.name,
      state: "unconfigured",
      latencyMs: null,
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();

  try {
    const res = await fetch(`${target.baseUrl.replace(/\/$/, "")}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Math.round(performance.now() - start);
    const body = await res.json().catch(() => null);

    return {
      name: target.name,
      state: res.ok ? "up" : "down",
      latencyMs,
      checks: body?.checks,
      uptimeSeconds: body?.uptimeSeconds,
      checkedAt,
    };
  } catch (error) {
    return {
      name: target.name,
      state: "unreachable",
      latencyMs: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : "Unknown error",
      checkedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkAllServices(): Promise<ServiceHealthResult[]> {
  return Promise.all(SERVICE_HEALTH_TARGETS.map((t) => checkServiceHealth(t)));
}
