const SERVICES = {
  cart: process.env.NEXT_PUBLIC_CART_SERVICE_URL,
  product: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  order: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  payment: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
};

export const api = {
  getCart: (token: string) => {
    fetch(`${SERVICES.cart}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
  },

  getProducts: () =>
    fetch(`${SERVICES.product}/products`).then((res) => res.json()),

  createOrder: (data: any, token: string) =>
    fetch(`${SERVICES.order}/checkout`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json()),
};
// export async function fetcher<T>(path: string): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error(`API error occurred: ${res.statusText}`);
//   }

//   return res.json();
// }
