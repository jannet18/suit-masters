"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

interface Order {
  id: number;
  total: string;
  status: string;
  createdAt: string;
}

interface RefundRequest {
  id: number;
  orderId: number;
  status: string;
  reason: string;
  description?: string;
  refundAmount: string;
  createdAt: string;
}

const REFUND_REASONS = [
  { value: "wrong_size", label: "Wrong Size / Does Not Fit" },
  { value: "defective", label: "Defective / Damaged" },
  { value: "not_as_described", label: "Not as Described" },
  { value: "changed_mind", label: "Changed My Mind" },
  { value: "late_delivery", label: "Late Delivery" },
  { value: "other", label: "Other" },
];

export default function RefundRequestPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (!userData) {
        router.replace("/api/auth/login?redirect=/account/refunds");
      } else {
        fetchData();
      }
    });
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, refundsRes] = await Promise.all([
        fetch("/api/orders", { credentials: "include" }),
        fetch("/api/refunds", { credentials: "include" }),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
      if (refundsRes.ok) {
        const refundsData = await refundsRes.json();
        setRefunds(refundsData.refunds || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrderId || !reason) {
      setMessage("Please select an order and reason");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: selectedOrderId,
          reason,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Refund request submitted successfully!");
        setMessageType("success");
        setShowForm(false);
        setSelectedOrderId(null);
        setReason("");
        setDescription("");
        fetchData();
      } else {
        setMessage(data.error || "Failed to submit refund request");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to submit refund request");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "requested":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
      case "processing":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-900/30 text-yellow-400";
      case "approved":
        return "bg-blue-900/30 text-blue-400";
      case "processing":
        return "bg-indigo-900/30 text-indigo-400";
      case "completed":
        return "bg-green-900/30 text-green-400";
      case "rejected":
        return "bg-red-900/30 text-red-400";
      default:
        return "bg-gray-900/30 text-gray-400";
    }
  };

  const refundableOrders = orders.filter(
    (o) => o.status === "delivered" || o.status === "shipped"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-[#c9a96e] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb]">
      <header className="border-b border-[#2e2e2e]">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/account" className="text-[#c9a96e] hover:text-white text-sm flex items-center gap-2 mb-4">
            <ArrowLeft size={14} />
            Back to Account
          </Link>
          <h1 className="font-serif text-3xl font-bold">Refund and Returns</h1>
          <p className="text-[#9a9490] mt-2">Request a refund or return for your order</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {message && (
          <div className={`p-4 rounded-lg border ${
            messageType === "success"
              ? "bg-green-900/30 border-green-700 text-green-300"
              : "bg-red-900/30 border-red-700 text-red-300"
          }`}>
            {message}
          </div>
        )}

        {/* Request New Refund */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-xl font-semibold">Request a Refund</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-[#c9a96e] text-black text-sm font-medium rounded-lg hover:bg-[#d8b87c] transition-colors"
              >
                + New Request
              </button>
            )}
          </div>

          {showForm ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#9a9490] mb-2">Select Order</label>
                {refundableOrders.length === 0 ? (
                  <p className="text-[#6b6560] text-sm">
                    No orders eligible for refund. Only shipped or delivered orders can be refunded.
                  </p>
                ) : (
                  <select
                    value={selectedOrderId || ""}
                    onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                    className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                  >
                    <option value="">Select an order...</option>
                    {refundableOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        Order #{order.id} - {parseFloat(order.total).toFixed(2)} ({order.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#9a9490] mb-2">Reason for Refund</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                >
                  <option value="">Select a reason...</option>
                  {REFUND_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#9a9490] mb-2">Additional Details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide any additional details about your refund request..."
                  className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a96e] min-h-25"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => { setShowForm(false); setSelectedOrderId(null); setReason(""); setDescription(""); setMessage(null); }}
                  className="px-6 py-3 border border-[#2e2e2e] text-[#f5f0eb] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedOrderId || !reason}
                  className="px-6 py-3 bg-[#c9a96e] text-black font-medium rounded-lg hover:bg-[#d8b87c] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[#6b6560] text-sm">
              Select an order to request a refund. Only shipped or delivered orders are eligible.
            </p>
          )}
        </div>

        {/* Existing Refund Requests */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-6">
          <h2 className="font-serif text-xl font-semibold mb-6">Your Refund Requests</h2>
          {refunds.length === 0 ? (
            <p className="text-[#6b6560] text-center py-8">No refund requests yet.</p>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => (
                <div key={refund.id} className="bg-[#2e2e2e] rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">Refund #{refund.id}</span>
                        <span className="text-[#9a9490] text-sm">Order #{refund.orderId}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                          {getStatusIcon(refund.status)}
                          {refund.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                      <p className="text-sm text-[#9a9490]">
                        Reason: {REFUND_REASONS.find((r) => r.value === refund.reason)?.label || refund.reason}
                      </p>
                      {refund.description && (
                        <p className="text-sm text-[#6b6560] mt-1">{refund.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[#c9a96e]">
                        {parseFloat(refund.refundAmount || "0").toFixed(2)}
                      </p>
                      <p className="text-xs text-[#6b6560] mt-1">
                        {new Date(refund.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}