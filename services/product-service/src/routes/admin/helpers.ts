import type { Context } from "hono";
import { getUser, requireRole } from "@repo/auth";

export const requireAdmin = [getUser, requireRole("ADMIN")] as const;

/** Parse a positive integer route param, or null if it isn't one. */
export function parseId(c: Context, name = "id"): number | null {
  const id = Number(c.req.param(name));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return undefined;
  }
}

/** Postgres error code from a raw pg error or one wrapped by Drizzle. */
export function pgErrorCode(error: unknown): string | undefined {
  const err = error as { code?: string; cause?: { code?: string } };
  return err?.code ?? err?.cause?.code;
}

export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";
export const PG_CHECK_VIOLATION = "23514";
