"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

interface Order {
  id: number;
  total: string;
  status: string;
  orderedItems: number;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        router.replace(`/api/auth/login?redirect=${pathname}`);
      } else {
        setUser(user);
        fetchOrders();
      }
    });
  }, [router, pathname]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders`,
        {
          credentials: "include",
        },
      );

      // if (res.status === 401) {
      //   router.replace("/api/auth/login");
      //   return;
      // }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <div className="p-10">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="p-10">
        <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
        <button
          onClick={() => router.push("/shop")}
          className="px-4 py-2 bg-black text-white"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => router.push(`/account/orders/${order.id}`)}
            className="border p-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <span className="font-semibold">Order #{order.id}</span>
              <span>{order.status}</span>
            </div>

            <div className="text-sm text-gray-600 mt-2">
              {order.orderedItems} items
            </div>

            <div className="mt-2 font-medium">
              USD {Number(order.total).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
