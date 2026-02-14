import { getOrder } from "@/app/lib/api/orders";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: number;
  total: string;
  status: string;
  created_at?: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderIdParam) {
      router.push("/");
      return;
    }

    const orderId = Number(orderIdParam);
    getOrder(orderId)
      .then(setOrder)
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [orderIdParam]);

  if (loading) return <p className="p-6">Loading Orders</p>;
  if (!order) return <p className="p-6">Order not found</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful 🎉
      </h1>

      <div className="border rounded-lg p-4 space-y-2">
        <p>
          <strong>Order ID:</strong> #{order.id}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Total Paid:</strong> KES {order.total}
        </p>
      </div>

      <button
        onClick={() => router.push("/orders")}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        View My Orders
      </button>
    </div>
  );
}
