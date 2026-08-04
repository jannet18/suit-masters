// import { URLSearchParams } from "url";
// const BASE_URL =
//   process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:3001/api";
// const SERVICES = {
//   cart: process.env.NEXT_PUBLIC_CART_SERVICE_URL || "http://localhost:3001/api",
//   product: BASE_URL,
//   order:
//     process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:3001/api",
//   payment:
//     process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:3001/api",
// };
const SERVICES = {
  cart: process.env.NEXT_PUBLIC_CART_SERVICE_URL || "http://localhost:3001/api",
  product:
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:4000",
  order:
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:3001/api",
  payment:
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:3001/api",
};

export const api = {
  // --- Cart ---
  getCart: async (token: string) => {
    try {
      const res = await fetch(`${SERVICES.cart}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
        return res.ok ? await res.json() : { success: false, cart: null };
    } catch (error) {
      console.error("Error fetching cart: ", error);
      return { success: false, cart: null };
    }
  },

  // --- Products ---
  // getProducts: async (params?: { category?: string; search?: string }) => {
  //   try {
  //     const filteredParams = Object.fromEntries(
  //       Object.entries(params || {}).filter(([_, v]) => v != null),
  //     );
  //     // Manually construct query string to avoid URLSearchParams issues
  //     const queryParts = [];
  //     for (const [key, value] of Object.entries(filteredParams)) {
  //       queryParts.push(
  //         `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`,
  //       );
  //     }
  //     const queryString =
  //       queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  //     const res = await fetch(`${SERVICES.product}/products${queryString}`);
  //     return res.ok ? res.json() : { success: false, products: [] };
  //   } catch (error) {
  //     console.log("Error fetching products: ", error);
  //     return { success: false, products: [] };
  //   }
  // },
  getProducts: async (params?: { category?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val != null) query.append(key, val);
        });
      }
      const queryString = query.toString() ? `?${query.toString()}` : "";
      const res = await fetch(`${SERVICES.product}/products${queryString}`);
      return res.ok ? await res.json() : { success: false, products: [] };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, products: [] };
    }
  },

  getProductById: async (id: number) => {
    try {
      const res = await fetch(`${SERVICES.product}/products/${id}`);
     return res.ok ? await res.json(): {success: false, product: null}
    } catch (error) {
      console.error("Error fetching product: ", error);
      return { success: false, product: null };
    }
  },
// Product by slug
getProductBySlug: async (slug: string) => {
  try {
    const res = await fetch(`${SERVICES.product}/products/slug/${slug}`)
    return res.ok ? await res.json(): {success: false, product: null}
  } catch (error) {
    console.error("Error fetching product by slug:", error)
    return {success: false, product: null}
  }
},
  // --- Categories ---
  getCategories: async () => {
    try {
      const res = await fetch(`${SERVICES.product}/categories`);
      if (res.ok) {
        return res.json();
      } else {
        console.log("Failed to fetch categories: ", res.statusText);
        return { success: false, categories: [] };
      }
    } catch (error) {
      console.log("Error fetching categories: ", error);
      return { success: false, categories: [] };
    }
  },

  // getProductsByCategory: async (slug: string) => {
  //   try {
  //     const res = await fetch(
  //       `${SERVICES.product}/categories/${slug}/products`,
  //     );
  //     if (res.ok) {
  //       return res.json();
  //     } else {
  //       console.log("Failed to fetch products by category: ", res.statusText);
  //       return { success: false, category: null, products: [] };
  //     }
  //   } catch (error) {
  //     console.log("Error fetching products by category: ", error);
  //     return { success: false, category: null, products: [] };
  //   }
  // },

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
      const res = await fetch(`${SERVICES.product}/collections/${slug}`);
      if (!res.ok) throw new Error("Collection fetch failed");
      return res.json();
    } catch (error) {
      return { success: false, collection: null, products: [] };
    }
  },

  // --- Orders ---
  getOrders: async (data: any, token: string) => {
    try {
      const res = await fetch(`${SERVICES.order}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      const res = await fetch(`${SERVICES.order}/orders`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return res.ok ? await res.json(): {success: false, order: null}
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

  // getProductBySlug: async (slug: string) => {
  //   try {
  //     const res = await fetch(`${SERVICES.product}/products/${slug}`);
  //     if (!res.ok) throw new Error("Not found");
  //     return res.json();
  //   } catch (error) {
  //     return { success: false, product: null };
  //   }
  // },

  createBespokeOrder: async (data: any, token?: string) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${SERVICES.order}/orders/bespoke`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      return response.ok ? await response.json(): {success: false, order: null}
    } catch (error) {
      console.error("Error creating bespoke order: ", error);
      return { success: false, order: null };
    }
  },

  // --- Search Suggestions ---
  getSearchSuggestions: async (query: string, limit: number = 5) => {
    try {
      if (!query || query.trim().length < 2) {
        return { success: true, suggestions: [] };
      }
      const params = new URLSearchParams({q: query, limit: String(limit)});
      const res = await fetch(
        `${SERVICES.product}/products/suggestions?${params.toString()}`,
      );
      return res.ok ? await res.json(): {success: false, suggestions: []}
    } catch (error) {
      console.log("Error fetching search suggestions: ", error);
      return { success: false, suggestions: [] };
    }
  },

  // --- Measurement Definitions ---
  getMeasurementDefinitions: async () => {
    try {
      const res = await fetch(`${SERVICES.product}/measurements/definitions`);
      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        console.log(
          "Failed to fetch measurement definitions: ",
          res.statusText,
        );
        return { success: false, definitions: [] };
      }
    } catch (error) {
      console.log("Error fetching measurement definitions: ", error);
      return { success: false, definitions: [] };
    }
  },
};
