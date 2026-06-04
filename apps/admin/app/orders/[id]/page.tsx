"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi, AdminOrder } from "../../../lib/api-client";
import Link from "next/link";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const result = await adminApi.getOrderById(params.id as string);
        if (result.success && result.order) {
          setOrder(result.order);
          setSelectedStatus(result.order.status);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) return;

    setUpdating(true);
    try {
      const result = await adminApi.updateOrderStatus(
        params.id as string,
        selectedStatus,
      );
      if (result.success && result.order) {
        setOrder(result.order);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-500 mb-4">
          The order you are looking for does not exist.
        </p>
        <Link
          href="/orders"
          className="text-blue-600 hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; Back to Orders
        </Link>
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Order Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Order ID</dt>
                <dd className="font-medium">#{order.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                    </span>
                </dd>
                </div>
              <div>
                <dt className="text-sm text-gray-500">Total</dt>
                <dd className="font-medium">
                  £
                  {order.total
                    ? (parseFloat(order.total) / 100).toFixed(2)
                    : "0.00"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Items</dt>
                <dd className="font-medium">{order.orderedItems || 0}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="font-medium">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </dd>
              </div>
              {order.estimatedDeliveryDate && (
                <div>
                  <dt className="text-sm text-gray-500">Est. Delivery</dt>
                  <dd className="font-medium">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString(
                      "en-GB",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="font-medium">
                  {order.customerName || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="font-medium">
                  {order.customerEmail || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Status Update Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>

              {/* Status Timeline */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  Timeline
                </h3>
                <div className="space-y-3">
                  {ORDER_STATUSES.map((status, idx) => {
                    const currentIdx = ORDER_STATUSES.indexOf(
                      order.status as (typeof ORDER_STATUSES)[number],
                    );
                    const statusIdx = ORDER_STATUSES.indexOf(status);
                    const isComplete = statusIdx <= currentIdx;

                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isComplete
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isComplete
                              ? "text-gray-900 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
