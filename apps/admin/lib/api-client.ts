import { cookies } from "next/headers";

const SERVICES = {
  product:
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:4000",
  order:
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:4001",
  payment:
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:4002",
};

// Server-side fetches don't automatically carry the admin's browser session
// cookie, so it's forwarded explicitly on every admin-gated request.
async function authHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  return cookieHeader ? { Cookie: cookieHeader } : {};
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  product_type: "STANDARD" | "CUSTOM";
  description?: string;
  product_image?: { default?: string };
  is_active?: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string;
  phone?: string;
  address?: string;
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
  id: number;
  amount: string;
  status: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

export interface AdminOrderStats {
  revenueByMonth: { month: string; total: number; successful: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: {
    id: number;
    customerName: string;
    total: string;
    status: string;
    createdAt: string;
  }[];
}

export const adminApi = {
  // --- Products ---
  getProducts: async (): Promise<{ success: boolean; products: AdminProduct[] }> => {
    try {
      const res = await fetch(`${SERVICES.product}/products`, { cache: "no-store" });
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
  getUsers: async (): Promise<{ success: boolean; users: AdminUser[] }> => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${SERVICES.product}/users`, { headers, cache: "no-store" });
      if (res.ok) {
        return res.json();
      }
      return { success: false, users: [] };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { success: false, users: [] };
    }
  },

  getUserById: async (id: string): Promise<{ success: boolean; user: AdminUser | null }> => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${SERVICES.product}/users/${id}`, { headers, cache: "no-store" });
      if (res.ok) {
        return res.json();
      }
      return { success: false, user: null };
    } catch (error) {
      console.error("Error fetching user:", error);
      return { success: false, user: null };
    }
  },

  updateUser: async (
    id: string,
    updates: { name?: string; phone?: string; address?: string; roles?: string },
  ): Promise<{ success: boolean; user: AdminUser | null }> => {
    try {
      const headers = { ...(await authHeaders()), "Content-Type": "application/json" };
      const res = await fetch(`${SERVICES.product}/users/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return res.json();
      }
      return { success: false, user: null };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, user: null };
    }
  },

  // --- Orders ---
  getOrders: async (): Promise<{ success: boolean; orders: AdminOrder[] }> => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${SERVICES.order}/orders/admin/all`, { headers, cache: "no-store" });
      if (res.ok) {
        return res.json();
      }
      return { success: false, orders: [] };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { success: false, orders: [] };
    }
  },

  getOrderStats: async (): Promise<{ success: boolean } & Partial<AdminOrderStats>> => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${SERVICES.order}/orders/admin/stats`, { headers, cache: "no-store" });
      if (res.ok) {
        return res.json();
      }
      return { success: false, revenueByMonth: [], ordersByStatus: [], recentOrders: [] };
    } catch (error) {
      console.error("Error fetching order stats:", error);
      return { success: false, revenueByMonth: [], ordersByStatus: [], recentOrders: [] };
    }
  },

  getOrderById: async (id: string): Promise<{ success: boolean; order: AdminOrder | null }> => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${SERVICES.order}/orders/${id}`, { headers, cache: "no-store" });
      if (res.ok) {
        const order = await res.json();
        return { success: true, order };
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
  ): Promise<{ success: boolean; order: AdminOrder | null }> => {
    try {
      const headers = { ...(await authHeaders()), "Content-Type": "application/json" };
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
  getPayments: async (): Promise<{ success: boolean; payments: AdminPayment[] }> => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${SERVICES.payment}/payments`, { headers, cache: "no-store" });
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
