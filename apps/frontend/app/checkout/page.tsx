"use client";

import { useState } from "react";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { v4 as uuidv4 } from "uuid";
import { stripePromise } from "../../lib/stripe";

function CheckoutClient() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCheckout = async (shippingData: any) => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // STEP 1: Create the Order (The "Checkout" logic we just refactored)
      // We generate a UUID for idempotency to prevent double-charging
      const idempotencyKey = uuidv4();

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ shipping: shippingData }),
      });

      const { orderId, error: orderError } = await orderResponse.json();
      if (orderError) throw new Error(orderError);

      // STEP 2: Create Payment Intent
      // Now that we have a real Order ID, we ask the Payment Service for a secret
      const intentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const { clientSecret, error: intentError } = await intentResponse.json();
      if (intentError) throw new Error(intentError);

      // STEP 3: Confirm Payment with Stripe
      // Elements handles the UI; this call triggers the actual bank transaction
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/order-confirmation?id=${orderId}`,
          },
          // We set redirect: "if_required" for seamless single-page feel
          redirect: "if_required",
        },
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        // SUCCESS: The Webhook will handle the DB status update to "PAID"
        return { success: true, orderId };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  // Minimal UI: PaymentElement should be mounted by Elements on the page when clientSecret provided server-side.
  // This button demonstrates calling the same `processCheckout` logic from the client.
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div>
        <PaymentElement />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => processCheckout({})}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing…" : "Pay"}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutClient />
    </Elements>
  );
}
