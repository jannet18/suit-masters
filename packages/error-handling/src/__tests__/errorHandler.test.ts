import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import {
  ErrorSeverity,
  errorHandler,
  notFoundHandler,
  reportError,
} from "../index.js";

/** A service wired the way every Suit Masters service is. */
function makeService() {
  const app = new Hono();
  app.get("/ok", (c) => c.json({ ok: true }));
  app.get("/boom", () => {
    throw new Error("database exploded: password=hunter2");
  });
  app.get("/async-boom", async () => {
    await Promise.resolve();
    throw new TypeError("cannot read properties of undefined");
  });
  // A sub-router, as services mount routes: errors must still reach onError
  const orders = new Hono();
  orders.get("/:id", () => {
    throw new Error("order lookup failed");
  });
  app.route("/orders", orders);
  app.onError(errorHandler);
  app.notFound(notFoundHandler);
  return app;
}

describe("errorHandler", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;
  const env = { ...process.env };

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.SERVICE_NAME = "order-service";
  });
  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...env };
  });

  it("returns a structured 500 with a request id", async () => {
    const res = await makeService().request("/boom");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({
      error: "Internal Server Error",
      message: "database exploded: password=hunter2",
      requestId: expect.stringMatching(/^[0-9a-f-]{36}$/),
    });
  });

  it("hides internal error messages in production", async () => {
    process.env.NODE_ENV = "production";
    const body = await (await makeService().request("/boom")).json();
    expect(body.message).toBe("An unexpected error occurred");
    expect(JSON.stringify(body)).not.toContain("hunter2");
  });

  it("gives every failure a distinct request id", async () => {
    const app = makeService();
    const [a, b] = await Promise.all([
      app.request("/boom"),
      app.request("/boom"),
    ]);
    expect((await a.json()).requestId).not.toBe((await b.json()).requestId);
  });

  it("catches async errors and errors thrown in mounted sub-routers", async () => {
    const app = makeService();
    expect((await app.request("/async-boom")).status).toBe(500);
    const res = await app.request("/orders/42");
    expect(res.status).toBe(500);
    expect((await res.json()).message).toBe("order lookup failed");
  });

  it("reports the failure with service, method, path and stack", async () => {
    await makeService().request("/orders/42");
    expect(consoleError).toHaveBeenCalledTimes(1);
    const [line, details] = consoleError.mock.calls[0]! as [
      string,
      { stack: string },
    ];
    expect(line).toBe("[HIGH][order-service] order lookup failed");
    expect(details).toMatchObject({
      method: "GET",
      path: expect.stringContaining("/orders/42"),
    });
    expect(details.stack).toContain("order lookup failed");
  });

  it("does not interfere with successful responses", async () => {
    const res = await makeService().request("/ok");
    expect(res.status).toBe(200);
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe("notFoundHandler", () => {
  it("returns a structured 404 naming the route", async () => {
    const res = await makeService().request("/nope", { method: "DELETE" });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "Not Found",
      message: expect.stringMatching(/^Route DELETE .*\/nope not found$/),
    });
  });
});

describe("reportError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs high/critical as errors and lower severities as warnings", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const base = {
      message: "m",
      service: "s",
      timestamp: new Date().toISOString(),
    };

    reportError({ ...base, severity: ErrorSeverity.CRITICAL });
    reportError({ ...base, severity: ErrorSeverity.LOW });

    expect(error).toHaveBeenCalledWith("[CRITICAL][s] m", expect.any(Object));
    expect(warn).toHaveBeenCalledWith("[LOW][s] m", expect.any(Object));
  });
});
