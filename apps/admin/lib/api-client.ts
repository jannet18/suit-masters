const SERVICES = {
  product:
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:4000",
  order: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:4001",
  payment:
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:3001/api",
};

// Money: every amount in these types is integer minor units (pence).
// Display with formatCurrency() from @repo/pricing; never divide by 100.

export interface AdminProduct {
  id: number;
  name: string;
  base_price: number;
  product_type: "STANDARD" | "CUSTOM";
  description?: string;
  short_description?: string;
  image_url?: string;
  sizes?: string[];
  colors?: string[];
  created_at?: string;
}

// --- Catalog management ---

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  productType: "STANDARD" | "CUSTOM";
  basePrice: number;
  description: string | null;
  mainImage: string | null;
  productImage: string | null;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  fabricId: number;
  /** Units available across active SKUs; null when made to order (untracked). */
  stock: number | null;
}

export interface ProductSku {
  id: number;
  productId: number;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  isActive: boolean | null;
}

export interface ProductDetail extends Omit<
  CatalogProduct,
  "categoryName" | "stock"
> {
  items: ProductSku[];
  collectionIds: number[];
}

export interface ProductFormOptions {
  categories: { id: number; name: string; parentId: number | null }[];
  fabrics: { id: number; name: string; sku: string }[];
  collections: { id: number; name: string }[];
}

export interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  productCount: number;
}

export interface CatalogCollection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  productIds: number[];
}

export interface ProductInput {
  name: string;
  slug: string;
  categoryId: number;
  fabricId: number;
  productType?: "STANDARD" | "CUSTOM";
  basePrice: number;
  description?: string;
  mainImage?: string;
  productImage?: string;
  isActive?: boolean;
  collectionIds?: number[];
  /** Create only: creates a default SKU with this stock. Omit for made to order. */
  initialStock?: number;
}

export type StockInput =
  | { stock: number; productItemId?: number }
  | { delta: number; productItemId?: number };

export interface CategoryInput {
  name: string;
  slug: string;
  parentId?: number | null;
}

export interface CollectionInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  productIds?: number[];
}

export type ApiResult<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

/**
 * Authenticated JSON request to a backend service. Never throws: network and
 * HTTP failures come back as `{ success: false, error }` with the service's
 * own message when it sent one.
 */
async function request<T>(
  url: string,
  {
    method = "GET",
    body,
    token,
  }: { method?: string; body?: unknown; token?: string },
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error =
        (Array.isArray(data.errors) && data.errors.join("; ")) ||
        data.error ||
        `Request failed (${res.status})`;
      return { success: false, error };
    }
    return { ...data, success: true };
  } catch (error) {
    console.error(`${method} ${url} failed:`, error);
    return { success: false, error: "Service unavailable" };
  }
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string;
  created_at?: string;
}

export interface AdminOrder {
  id: number;
  userId: string;
  total: number;
  status: string;
  orderedItems?: number;
  createdAt: string;
  estimatedDeliveryDate?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface AdminPayment {
  id: string;
  amount: number;
  status: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

export const adminApi = {
  // --- Products ---
  getProducts: async (): Promise<{
    success: boolean;
    products: AdminProduct[];
  }> => {
    try {
      const res = await fetch(`${SERVICES.product}/products`);
      if (res.ok) {
        return res.json();
      }
      return { success: false, products: [] };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, products: [] };
    }
  },

  // --- Users ---
  getUsers: async (
    token?: string,
  ): Promise<{ success: boolean; users: AdminUser[] }> => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${SERVICES.product}/users`, { headers });
      if (res.ok) {
        return res.json();
      }
      return { success: false, users: [] };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { success: false, users: [] };
    }
  },

  // --- Orders ---
  getOrders: async (
    token?: string,
  ): Promise<{ success: boolean; orders: AdminOrder[] }> => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${SERVICES.order}/orders/admin/all`, {
        headers,
      });
      if (res.ok) {
        return res.json();
      }
      return { success: false, orders: [] };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { success: false, orders: [] };
    }
  },

  getOrderById: async (
    id: string,
    token?: string,
  ): Promise<{ success: boolean; order: AdminOrder | null }> => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${SERVICES.order}/orders/${id}`, { headers });
      if (res.ok) {
        // The order service returns the order itself, not an envelope
        return { success: true, order: await res.json() };
      }
      return { success: false, order: null };
    } catch (error) {
      console.error("Error fetching order:", error);
      return { success: false, order: null };
    }
  },

  updateOrderStatus: async (
    id: string,
    status: string,
    trackingNumber?: string,
    trackingCarrier?: string,
    token?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const body: Record<string, string> = { status };
    if (trackingNumber) body.trackingNumber = trackingNumber;
    if (trackingCarrier) body.trackingCarrier = trackingCarrier;
    // The order service refuses invalid transitions (409) with a reason
    return request(`${SERVICES.order}/orders/${id}/status`, {
      method: "PUT",
      body,
      token,
    });
  },

  // --- Payments ---
  getPayments: async (
    token?: string,
  ): Promise<{ success: boolean; payments: AdminPayment[] }> => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${SERVICES.payment}/payments`, { headers });
      if (res.ok) {
        return res.json();
      }
      return { success: false, payments: [] };
    } catch (error) {
      console.error("Error fetching payments:", error);
      return { success: false, payments: [] };
    }
  },

  // --- Catalog management (ADMIN) ---
  getCatalogProducts: (token?: string) =>
    request<{ products: CatalogProduct[] }>(
      `${SERVICES.product}/products/admin/all`,
      { token },
    ),

  getProduct: (id: number, token?: string) =>
    request<{ product: ProductDetail }>(
      `${SERVICES.product}/products/admin/${id}`,
      { token },
    ),

  getProductFormOptions: (token?: string) =>
    request<ProductFormOptions>(
      `${SERVICES.product}/products/admin/form-options`,
      { token },
    ),

  createProduct: (data: ProductInput, token?: string) =>
    request<{ product: ProductDetail }>(`${SERVICES.product}/products`, {
      method: "POST",
      body: data,
      token,
    }),

  updateProduct: (
    id: number,
    data: Partial<Omit<ProductInput, "initialStock">>,
    token?: string,
  ) =>
    request<{ product: ProductDetail }>(`${SERVICES.product}/products/${id}`, {
      method: "PATCH",
      body: data,
      token,
    }),

  /** Soft-deletes (deactivates) unless `hard` is true. */
  deleteProduct: (
    id: number,
    { hard = false }: { hard?: boolean } = {},
    token?: string,
  ) =>
    request<{ id: number; deleted: "soft" | "hard" }>(
      `${SERVICES.product}/products/${id}${hard ? "?hard=true" : ""}`,
      { method: "DELETE", token },
    ),

  updateStock: (id: number, stock: StockInput, token?: string) =>
    request<{ item: ProductSku }>(`${SERVICES.product}/products/${id}/stock`, {
      method: "PATCH",
      body: stock,
      token,
    }),

  getCategories: (token?: string) =>
    request<{ categories: CatalogCategory[] }>(
      `${SERVICES.product}/categories/admin/all`,
      { token },
    ),

  createCategory: (data: CategoryInput, token?: string) =>
    request<{ category: CatalogCategory }>(`${SERVICES.product}/categories`, {
      method: "POST",
      body: data,
      token,
    }),

  updateCategory: (id: number, data: Partial<CategoryInput>, token?: string) =>
    request<{ category: CatalogCategory }>(
      `${SERVICES.product}/categories/${id}`,
      {
        method: "PUT",
        body: data,
        token,
      },
    ),

  deleteCategory: (id: number, token?: string) =>
    request<{ id: number }>(`${SERVICES.product}/categories/${id}`, {
      method: "DELETE",
      token,
    }),

  getCollections: (token?: string) =>
    request<{ collections: CatalogCollection[] }>(
      `${SERVICES.product}/collections/admin/all`,
      { token },
    ),

  createCollection: (data: CollectionInput, token?: string) =>
    request<{ collection: CatalogCollection }>(
      `${SERVICES.product}/collections`,
      {
        method: "POST",
        body: data,
        token,
      },
    ),

  updateCollection: (
    id: number,
    data: Partial<CollectionInput>,
    token?: string,
  ) =>
    request<{ collection: CatalogCollection }>(
      `${SERVICES.product}/collections/${id}`,
      {
        method: "PUT",
        body: data,
        token,
      },
    ),

  deleteCollection: (id: number, token?: string) =>
    request<{ id: number }>(`${SERVICES.product}/collections/${id}`, {
      method: "DELETE",
      token,
    }),
};
