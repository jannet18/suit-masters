"use client";

import { useEffect, useState } from "react";

interface RefundRequest {
  id: number;
  orderId: number;
  userId: string;
  status: string;
  reason: string;
  description?: string;
  quantity: number;
  refundAmount: string;
  stripeRefundId?: string;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

const ORDER_SERVICE_URL =
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:4001";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ORDER_SERVICE_URL}/refunds/admin/all`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRefunds(data.refunds || []);
      }
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (refundId: number) => {
    setActionLoading(refundId);
    try {
      const res = await fetch(`${ORDER_SERVICE_URL}/refunds/${refundId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes: adminNotes[refundId] || "" }),
      });
      if (res.ok) {
        fetchRefunds();
      }
    } catch (error) {
      console.error("Failed to approve refund:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (refundId: number) => {
    setActionLoading(refundId);
    try {
      const res = await fetch(`${ORDER_SERVICE_URL}/refunds/${refundId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes: adminNotes[refundId] || "" }),
      });
      if (res.ok) {
        fetchRefunds();
      }
    } catch (error) {
      console.error("Failed to reject refund:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (refundId: number) => {
    setActionLoading(refundId);
    try {
      const res = await fetch(`${ORDER_SERVICE_URL}/refunds/${refundId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        fetchRefunds();
      }
    } catch (error) {
      console.error("Failed to complete refund:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      wrong_size: "Wrong Size",
      defective: "Defective",
      not_as_described: "Not as Described",
      changed_mind: "Changed Mind",
      late_delivery: "Late Delivery",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Refund Requests</h1>
        <p className="text-gray-500 mt-1">Manage customer refund and return requests</p>
      </div>

      {refunds.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-400 text-lg">No refund requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <div key={refund.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Refund #{refund.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                      {refund.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{refund.orderId} • User: {refund.userId.substring(0, 8)}...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">£{parseFloat(refund.refundAmount || "0").toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(refund.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Reason:</span>
                  <p className="font-medium">{getReasonLabel(refund.reason)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Qty:</span>
                  <p className="font-medium">{refund.quantity}</p>
                </div>
                {refund.stripeRefundId && (
                  <div>
                    <span className="text-gray-500">Stripe Refund ID:</span>
                    <p className="font-medium text-xs">{refund.stripeRefundId}</p>
                  </div>
                )}
                {refund.processedAt && (
                  <div>
                    <span className="text-gray-500">Processed:</span>
                    <p className="font-medium">{new Date(refund.processedAt).toLocaleDateString("en-GB")}</p>
                  </div>
                )}
              </div>

              {refund.description && (
                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded">
                  {refund.description}
                </p>
              )}

              {refund.adminNotes && (
                <p className="text-sm text-blue-600 mb-4 bg-blue-50 p-3 rounded">
                  Admin notes: {refund.adminNotes}
                </p>
              )}

              {/* Admin Notes Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Add admin notes..."
                  value={adminNotes[refund.id] || ""}
                  onChange={(e) => setAdminNotes({ ...adminNotes, [refund.id]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              {refund.status === "requested" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(refund.id)}
                    disabled={actionLoading === refund.id}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === refund.id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(refund.id)}
                    disabled={actionLoading === refund.id}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}

              {refund.status === "processing" && (
                <button
                  onClick={() => handleComplete(refund.id)}
                  disabled={actionLoading === refund.id}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === refund.id ? "Processing..." : "Mark as Completed"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}