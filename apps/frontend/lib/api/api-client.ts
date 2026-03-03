const SERVICES = {
  cart: process.env.NEXT_PUBLIC_CART_SERVICE_URL,
  product: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  order: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  payment: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
};

export const api = {
  // --- Cart ---
  getCart: async (token: string) => {
    try {
      const res = await fetch(`${SERVICES.cart}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch cart: ", res.statusText);
        return { success: false, cart: null };
      }
    } catch (error) {
      console.log("Error fetching cart: ", error);
      return { success: false, cart: null };  
    }
  },

  // --- Products ---
  getProducts: async (params?: { category?: string; search?: string }) => {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const res = await fetch(`${SERVICES.product}/products?${queryString}`);
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch products: ", res.statusText);
        return { success: false, products: [] };
      }
    } catch (error) {
      console.log("Error fetching products: ", error);
      return { success: false, products: [] };
    }
  },

  getProductById: async (id: number) => {
    try {
      const res = await fetch(`${SERVICES.product}/products/${id}`);
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch product: ", res.statusText);
        return { success: false, product: null };
      }
    } catch (error) {
      console.log("Error fetching product: ", error);
      return { success: false, product: null };
    }
  },

  // --- Collections ---
  getCollections: async () => {
    try {
      const res = await fetch(`${SERVICES.product}/collections`);
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch collections: ", res.statusText);
        return { success: false, collections: [] };
      }
    } catch (error) {
      console.log("Error: ", error);
      return { success: false, collections: [] };
    }
  },

  getProductsInCollection: async (slug: string) => {
    try {
      const res = await fetch(`${SERVICES.product}/collections/${slug}/products`);
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch collection products: ", res.statusText);
        return { success: false, products: [] };
      }
    } catch (error) {
      console.log("Error fetching collection products: ", error);
      return { success: false, products: [] };
    }
  },

  // --- Orders ---
  getOrders: async (data: any, token: string) => {
    try {
      const res = await fetch(`${SERVICES.order}/orders`);
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch orders: ", res.statusText);
        return { success: false, orders: [] };
      }
    } catch (error) {
      console.log("Error fetching orders: ", error);
      return { success: false, orders: [] };
    }
  },
  createOrder: async (data: any, token: string) => {
    try {
      const res = await fetch(`${SERVICES.order}/checkout`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to create order: ", res.statusText);
        return { success: false, order: null };
      }
    } catch (error) {
      console.log("Error performing checkout: ", error);
      return { success: false, order: null };
    }
  },

  // Example API function
  getCollectionBySlug: async (slug: string) => {
    try {
      const res = await fetch(`${SERVICES.product}/collections/${slug}`);
      if (res.ok) {
        return res.json(); // return { success: true, collection }
      } else {
        console.log("Failed to fetch collection: ", res.statusText);
        return { success: false, collection: null };
      }
    } catch (error) {
      console.log("Error fetching collection: ", error);
      return { success: false, collection: null };
    }
  },

  getProductBySlug: async (slug: string) => {
    try {
      const res = await fetch(`${SERVICES}/products/${slug}`);
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch product: ", res.statusText);
        return { success: false, product: null };
      }
    } catch (error) {
      console.log("Error fetching slugged product: ", error);
      return { success: false, product: null };
    }
  },

  createBespokeOrder: async (data: any) => {
    try {
      const response = await fetch("/api/checkout/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return response.json();
      } else {
        console.log("Failed to create bespoke order: ", response.statusText);
        return { success: false, order: null };
      }
    } catch (error) {
      console.log("Error creating bespoke order: ", error);
      return { success: false, order: null };
    }
  },
};
