const SERVICES = {
  cart: process.env.NEXT_PUBLIC_CART_SERVICE_URL,
  product: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  order: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  payment: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
};

export const api = {
  // --- Cart ---
  getCart: async (token: string) => {
    const res = await fetch(`${SERVICES.cart}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // --- Products ---
  getProducts: async () => {
    const res = await fetch(`${SERVICES.product}/products`);
    return res.json();
  },

  getProductById: async (id: number) => {
    const res = await fetch(`${SERVICES.product}/products/${id}`);
    return res.json();
  },

  // --- Collections ---
  getCollections: async () => {
    const res = await fetch(`${SERVICES.product}/collections`);
    return res.json();
  },

  getProductsInCollection: async (slug: string) => {
    const res = await fetch(`${SERVICES.product}/collections/${slug}/products`);
    return res.json();
  },

  // --- Orders ---
  createOrder: async (data: any, token: string) => {
    const res = await fetch(`${SERVICES.order}/checkout`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  },
};
