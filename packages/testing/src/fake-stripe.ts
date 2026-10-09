import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";

/**
 * A minimal in-process stand-in for the Stripe API, covering the calls the
 * services make (PaymentIntents create/retrieve/cancel, Refunds create).
 * Point a service at it with STRIPE_API_HOST/PORT/PROTOCOL. Every request is
 * recorded in `calls` for assertions. Unknown endpoints return 404.
 */

export interface FakePaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata: Record<string, string>;
}

export interface FakeStripe {
  url: string;
  port: number;
  calls: Array<{
    method: string;
    path: string;
    body: Record<string, string>;
    idempotencyKey?: string;
  }>;
  paymentIntents: Map<string, FakePaymentIntent>;
  refunds: Array<{ id: string; payment_intent: string; amount: number }>;
  /** Make the next refund request fail like a Stripe card error. */
  failNextRefund(message: string): void;
  close(): Promise<void>;
}

/** Stripe sends form-encoded bodies with bracketed keys: metadata[orderId]=1 */
function parseForm(raw: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(raw));
}

function metadataFrom(body: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(body)
      .filter(([k]) => k.startsWith("metadata["))
      .map(([k, v]) => [k.slice("metadata[".length, -1), v]),
  );
}

/** Alphanumeric id like Stripe's (e.g. 3Fake0000000000000000042), marked "Fake". */
function stripeId(n: number): string {
  return `3Fake${String(n).padStart(19, "0")}`;
}

async function readBody(req: IncomingMessage): Promise<string> {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw;
}

export async function startFakeStripe(port = 0): Promise<FakeStripe> {
  const paymentIntents = new Map<string, FakePaymentIntent>();
  const refunds: FakeStripe["refunds"] = [];
  const calls: FakeStripe["calls"] = [];
  const idempotent = new Map<string, unknown>();
  let counter = 0;
  let refundFailure: string | null = null;

  const server: Server = createServer(async (req, res) => {
    const path = (req.url ?? "").split("?")[0]!;
    const body = parseForm(await readBody(req));
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    calls.push({ method: req.method ?? "GET", path, body, idempotencyKey });

    const send = (status: number, payload: unknown) => {
      res.writeHead(status, {
        "content-type": "application/json",
        "request-id": `req_fake_${counter}`,
      });
      res.end(JSON.stringify(payload));
    };
    const error = (
      status: number,
      message: string,
      type = "invalid_request_error",
    ) => send(status, { error: { type, message } });

    if (
      idempotencyKey &&
      idempotent.has(`${req.method} ${path} ${idempotencyKey}`)
    ) {
      return send(
        200,
        idempotent.get(`${req.method} ${path} ${idempotencyKey}`),
      );
    }
    const remember = (payload: unknown) => {
      if (idempotencyKey)
        idempotent.set(`${req.method} ${path} ${idempotencyKey}`, payload);
      send(200, payload);
    };

    if (req.method === "GET" && path === "/health")
      return send(200, { ok: true });

    let match: RegExpMatchArray | null;
    if (req.method === "POST" && path === "/v1/payment_intents") {
      // Stripe-shaped ids: Stripe.js validates `${id}_secret_${secret}`
      const id = `pi_${stripeId(++counter)}`;
      const amount = Number(body.amount);
      if (!Number.isSafeInteger(amount) || amount < 1) {
        return error(400, "Invalid integer: amount");
      }
      const pi: FakePaymentIntent = {
        id,
        object: "payment_intent",
        amount,
        currency: body.currency ?? "gbp",
        status: "requires_payment_method",
        client_secret: `${id}_secret_${stripeId(counter)}`,
        metadata: metadataFrom(body),
      };
      paymentIntents.set(id, pi);
      return remember(pi);
    }
    if (
      req.method === "GET" &&
      (match = path.match(/^\/v1\/payment_intents\/([^/]+)$/))
    ) {
      const pi = paymentIntents.get(match[1]!);
      return pi
        ? send(200, pi)
        : error(404, `No such payment_intent: '${match[1]}'`);
    }
    if (
      req.method === "POST" &&
      (match = path.match(/^\/v1\/payment_intents\/([^/]+)\/cancel$/))
    ) {
      const pi = paymentIntents.get(match[1]!);
      if (!pi) return error(404, `No such payment_intent: '${match[1]}'`);
      if (pi.status === "succeeded") {
        return error(
          400,
          "You cannot cancel this PaymentIntent because it has a status of succeeded.",
        );
      }
      pi.status = "canceled";
      return remember(pi);
    }
    if (req.method === "POST" && path === "/v1/refunds") {
      if (refundFailure) {
        const message = refundFailure;
        refundFailure = null;
        return error(402, message, "card_error");
      }
      const refund = {
        id: `re_${stripeId(++counter)}`,
        object: "refund",
        payment_intent: body.payment_intent!,
        amount: Number(body.amount),
        status: "succeeded",
      };
      refunds.push(refund);
      return remember(refund);
    }
    error(404, `Fake Stripe does not implement ${req.method} ${path}`);
  });

  await new Promise<void>((resolve) =>
    server.listen(port, "127.0.0.1", resolve),
  );
  const { port: boundPort } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${boundPort}`,
    port: boundPort,
    calls,
    paymentIntents,
    refunds,
    failNextRefund(message) {
      refundFailure = message;
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

/** Env vars that point a service's Stripe client at the fake. */
export function fakeStripeEnv(fake: Pick<FakeStripe, "port">) {
  return {
    STRIPE_API_HOST: "127.0.0.1",
    STRIPE_API_PORT: String(fake.port),
    STRIPE_API_PROTOCOL: "http",
  };
}
