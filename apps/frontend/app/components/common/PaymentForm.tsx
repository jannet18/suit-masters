import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  orderId: number;

  shippingData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export default function PaymentForm({ orderId, shippingData }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?id=${orderId}`,

        payment_method_data: {
          billing_details: {
            name: shippingData.fullName,
            email: shippingData.email,
            phone: shippingData.phone,
            address: {
              line1: shippingData.address,
              city: shippingData.city,
              postal_code: shippingData.postalCode,
              country: "GB",
            },
          },
        },
      },

      redirect: "if_required",
    });

    if (error) {
      setError(error.message ?? "Payment failed.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      router.push(`/order-confirmation?id=${orderId}`);
    }
  }

  return (
    <>
      <PaymentElement />

      {error && <div className="text-red-400 mt-4">{error}</div>}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="mt-6 bg-[#c9a96e] text-black px-8 py-3 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin inline mr-2 h-4 w-4" />
            Processing...
          </>
        ) : (
          "Complete Payment"
        )}
      </button>
    </>
  );
}
