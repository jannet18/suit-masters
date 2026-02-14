export async function createOrder(shippingInfo: any) {
  const res = await fetch("http://localhost:4001/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ shipping: shippingInfo }),
  });

  if (!res.ok) throw new Error("Failed to create order");

  const data = await res.json();
  return data.orderId;
}

export async function createPaymentIntent(orderId: number) {
  const res = await fetch("http://localhost:4002/payments/create-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  if (!res.ok) throw new Error("Failed to create payment intent");

  const data = await res.json();
  return data.clientSecret;
}
