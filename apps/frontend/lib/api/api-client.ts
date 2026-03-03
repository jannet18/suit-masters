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
  getProducts: async (params?: { category?: string; search?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    const res = await fetch(`${SERVICES.product}/products?${queryString}`);
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
  getOrders: async (data: any, token: string) => {
    const res = await fetch(`${SERVICES.order}/orders`);
    return res.json();
  },
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

  // Example API function
  getCollectionBySlug: async (slug: string) => {
    const res = await fetch(`${SERVICES.product}/collections/${slug}`);
    return res.json(); // return { success: true, collection }
  },

  getProductBySlug: async (slug: string) => {
    const res = await fetch(`${SERVICES}/products/${slug}`);
    return res.json();
  },

  createBespokeOrder: async (data: any) => {
    const response = await fetch("/api/checkout/bespoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
