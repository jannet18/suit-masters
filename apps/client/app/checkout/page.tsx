"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { Elements } from "@stripe/react-stripe-js";
import ShippingForm from "../components/ShippingForm";
import PaymentForm from "../components/PaymentForm";
import { stripePromise } from "../lib/stripe";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // 🔐 LOGIN GUARD
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        // guest -> redirect to Kinde login with redirect back
        toast.info("Please sign in to proceed to checkout");
        router.replace("/api/auth/login?redirect=${pathname}");
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router, pathname]);

  if (loading) return <p>Checking session...</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {!orderId && (
        <ShippingForm
          onSuccess={(id: number) => {
            setOrderId(id);
          }}
        />
      )}

      {orderId && (
        <Elements stripe={stripePromise}>
          <PaymentForm orderId={orderId} />
        </Elements>
      )}
    </div>
  );
}
