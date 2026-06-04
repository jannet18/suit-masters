"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck } from "lucide-react";

interface OrderItem {
  id: number;
  productNameSnapshot: string;
  quantity: number;
  priceAtPurchase: string;
  customizationSnapsot?: Record<string, any>;
}

interface Order {
  id: number;
  status: string;
  total: string;
  orderDate: string;
  shipping_name: string;
  shipping_email: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_region: string;
  shipping_postal_code: string;
  shipping_country: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 404) throw new Error("Order not found");
          throw new Error("Failed to load order");
        }

        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-[#c9a96e] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#9a9490]">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-red-400" />
          </div>
          <h1 className="font-serif text-2xl text-[#f5f0eb] mb-2">
            Order Not Found
          </h1>
          <p className="text-[#9a9490] mb-8">{error || "Unable to load order details"}</p>
          <Link
            href="/account"
            className="inline-block px-8 py-3 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-colors"
          >
            Go to My Account
          </Link>
        </div>
      </div>
    );
  }

  const orderTotal = (Number(order.total) / 100).toFixed(2);
  const orderDate = new Date(order.orderDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb]">
      {/* Header */}
      <header className="border-b border-[#2e2e2e]">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/" className="text-xl font-serif tracking-wider text-[#c9a96e]">
            SUIT MASTERS
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3">
            Order Confirmed!
          </h1>
          <p className="text-[#9a9490] text-lg">
            Thank you for your order. Your bespoke suit is being prepared.
          </p>
        </div>

        {/* Order Reference */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-[#9a9490] text-xs tracking-widest uppercase mb-1">
                Order ID
              </p>
              <p className="font-mono text-[#c9a96e]">#{order.id}</p>
            </div>
            <div>
              <p className="text-[#9a9490] text-xs tracking-widest uppercase mb-1">
                Date
              </p>
              <p className="text-sm">{orderDate}</p>
            </div>
            <div>
              <p className="text-[#9a9490] text-xs tracking-widest uppercase mb-1">
                Status
              </p>
              <span className="inline-block px-3 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full font-medium">
                {order.status.replace("_", " ")}
              </span>
            </div>
            <div>
              <p className="text-[#9a9490] text-xs tracking-widest uppercase mb-1">
                Total
              </p>
              <p className="font-mono text-lg font-bold">£{orderTotal}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-6 mb-8">
          <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <Package size={18} className="text-[#c9a96e]" />
            Items Ordered
          </h2>
          <div className="divide-y divide-[#2e2e2e]">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {item.productNameSnapshot || "Custom Suit"}
                  </p>
                  <p className="text-sm text-[#9a9490]">
                    Qty: {item.quantity}
                  </p>
                  {item.customizationSnapsot &&
                    Object.keys(item.customizationSnapsot).length > 0 && (
                      <p className="text-xs text-[#6b6560] mt-1">
                        Custom specifications included
                      </p>
                    )}
                </div>
                <p className="font-mono">
                  £{((Number(item.priceAtPurchase) * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#2e2e2e] pt-4 mt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="font-mono">£{orderTotal}</span>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-6 mb-8">
          <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck size={18} className="text-[#c9a96e]" />
            Shipping Address
          </h2>
          <div className="text-[#d0cbc6] space-y-1">
            <p className="font-medium">{order.shipping_name}</p>
            <p>{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
            <p>
              {order.shipping_city}, {order.shipping_region}{" "}
              {order.shipping_postal_code}
            </p>
            <p>{order.shipping_country}</p>
            <p className="text-[#9a9490] text-sm mt-2">{order.shipping_email}</p>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-6 mb-8">
          <h2 className="font-serif text-lg font-semibold mb-2">
            Estimated Delivery
          </h2>
          <p className="text-[#9a9490]">
            Your bespoke suit typically takes{" "}
            <span className="text-[#f5f0eb] font-medium">4-6 weeks</span> to
            craft. You will receive a shipping notification once it's on its
            way.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account"
            className="px-8 py-3 bg-[#c9a96e] text-black rounded-lg font-medium hover:bg-[#d8b87c] transition-colors text-center"
          >
            View Order History
          </Link>
          <Link
            href="/"
            className="px-8 py-3 border border-[#2e2e2e] text-[#f5f0eb] rounded-lg font-medium hover:bg-[#1a1a1a] transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
