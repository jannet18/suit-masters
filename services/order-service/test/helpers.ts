import { db, eq, productItem, shopOrder } from "@repo/db";
import { json, UK_SHIPPING, type TestUser } from "@repo/testing";
import app from "../src/app.js";

export { app };

let keyCounter = 0;
export const idempotencyKey = () => `test-${Date.now()}-${++keyCounter}`;

export async function quote(user: TestUser, body: Record<string, unknown>) {
  const res = await app.request("/orders/quote", json(body, user.headers));
  return { status: res.status, body: (await res.json()) as any };
}

export async function placeOrder(
  user: TestUser,
  body: Record<string, unknown>,
  key: string = idempotencyKey(),
) {
  const res = await app.request(
    "/orders",
    json(
      { shipping: UK_SHIPPING, ...body },
      { ...user.headers, "Idempotency-Key": key },
    ),
  );
  return { status: res.status, body: (await res.json()) as any };
}

export async function stockOf(skuId: number): Promise<number> {
  const [row] = await db
    .select({ stock: productItem.stock })
    .from(productItem)
    .where(eq(productItem.id, skuId));
  return row!.stock;
}

export async function setStock(skuId: number, stock: number) {
  await db.update(productItem).set({ stock }).where(eq(productItem.id, skuId));
}

export async function orderRow(orderId: number) {
  return (await db.query.shopOrder.findFirst({
    where: eq(shopOrder.id, orderId),
    with: { items: true },
  }))!;
}

export async function setOrder(
  orderId: number,
  values: Partial<typeof shopOrder.$inferInsert>,
) {
  await db.update(shopOrder).set(values).where(eq(shopOrder.id, orderId));
}

export async function setStatus(
  admin: TestUser,
  orderId: number,
  status: string,
) {
  const res = await app.request(
    `/orders/${orderId}/status`,
    json({ status }, admin.headers, "PUT"),
  );
  return { status: res.status, body: (await res.json()) as any };
}
