const SERVICES = {
  product:
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:4000",
  order:
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:3001/api",
  payment:
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:3001/api",
};

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

export interface AdminUser {
  id: string;
  kinde_user_id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string;
  created_at?: string;
}

export interface AdminOrder {
  id: number;
  userId: string;
  total: string;
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
  getProducts: async (): Promise<{ success: boolean; products: AdminProduct[] }> => {
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
  getUsers: async (token?: string): Promise<{ success: boolean; users: AdminUser[] }> => {
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
  getOrders: async (token?: string): Promise<{ success: boolean; orders: AdminOrder[] }> => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${SERVICES.order}/orders`, { headers });
      if (res.ok) {
        return res.json();
      }
      return { success: false, orders: [] };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { success: false, orders: [] };
    }
  },

  getOrderById: async (id: string, token?: string): Promise<{ success: boolean; order: AdminOrder | null }> => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${SERVICES.order}/orders/${id}`, { headers });
      if (res.ok) {
        return res.json();
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
  ): Promise<{ success: boolean; order: AdminOrder | null }> => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const body: Record<string, string> = { status };
      if (trackingNumber) body.trackingNumber = trackingNumber;
      if (trackingCarrier) body.trackingCarrier = trackingCarrier;

      const res = await fetch(`${SERVICES.order}/orders/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        return res.json();
      }
      return { success: false, order: null };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, order: null };
    }
  },

  // --- Payments ---
  getPayments: async (token?: string): Promise<{ success: boolean; payments: AdminPayment[] }> => {
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
};
