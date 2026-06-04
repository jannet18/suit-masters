"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { v4 as uuidv4 } from "uuid";
import { stripePromise } from "../../lib/stripe";
import { getCurrentUser } from "../../lib/auth";
import { useCartStore } from "../stores/useCartStore";
import { getShippingCost, getTaxRate } from "../../lib/utils";
import { Loader2, ArrowLeft, MapPin, Package, CreditCard } from "lucide-react";

function CheckoutClient() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
  });
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const { cart, getTotal } = useCartStore();
  const subtotal = getTotal(); // already in pounds (divided by 100)

  // Map full country name to ISO code for shipping/tax calculations
  const countryToCode: Record<string, string> = {
    "United Kingdom": "GB",
    "United States": "US",
    Canada: "CA",
    Australia: "AU",
    Germany: "DE",
    France: "FR",
    Italy: "IT",
    Spain: "ES",
    Netherlands: "NL",
    Switzerland: "CH",
    Sweden: "SE",
    Norway: "NO",
    Denmark: "DK",
    Japan: "JP",
    "United Arab Emirates": "AE",
    Singapore: "SG",
  };

  const countryCode = countryToCode[shippingData.country] || "GB";
  const subtotalInCents = Math.round(subtotal * 100); // convert back to pence for utility
  const shippingCostInCents = getShippingCost(countryCode, subtotalInCents);
  const shippingCostInPounds = shippingCostInCents / 100;
  const taxRate = getTaxRate(countryCode);
  const taxAmount = subtotal * taxRate;
  const orderTotal = subtotal + shippingCostInPounds + taxAmount;

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        // Redirect to sign up page if not authenticated
        router.push("/api/auth/login?redirect=/checkout");
        return;
      }
      setIsAuthenticated(true);

      // Pre-fill shipping data with user info if available
      if (user) {
        setShippingData((prev) => ({
          ...prev,
          fullName: user.name || "",
          email: user.email || "",
        }));
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0 && isAuthenticated) {
      router.push("/cart");
    }
  }, [cart, isAuthenticated, router]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const processCheckout = async () => {
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
        body: JSON.stringify({
          shipping: shippingData,
          cartItems: cart,
          totalAmount: subtotal,
        }),
      });

      const { orderId, error: orderError } = await orderResponse.json();
      if (orderError) throw new Error(orderError);

      // STEP 2: Create Payment Intent
      // Now that we have a real Order ID, we ask the Payment Service for a secret
      const intentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount: orderTotal }),
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
          // We set redirect: "if_required" for seamless single-page feel
          redirect: "if_required",
        },
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        // SUCCESS: The Webhook will handle the DB status update to "PAID"
        router.push(`/order-confirmation?id=${orderId}`);
        return { success: true, orderId };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#c9a96e] mx-auto mb-4" />
          <p className="text-[#f5f0eb]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#f5f0eb] mb-4">Redirecting to sign up...</p>
          <Loader2 className="h-8 w-8 animate-spin text-[#c9a96e] mx-auto" />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-[#c9a96e] mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#f5f0eb] mb-2">
            Your cart is empty
          </h2>
          <p className="text-[#9a9490] mb-6">
            Add some products before checking out
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="bg-[#c9a96e] text-black px-6 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Forms */}
          <div className="lg:w-2/3">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-[#c9a96e] text-black" : "bg-white/10"}`}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9a9490]">
                    Step 1
                  </p>
                  <p className="font-medium">Shipping Details</p>
                </div>
              </div>

              <div className="h-px w-12 bg-white/10" />

              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step === "payment" ? "bg-[#c9a96e] text-black" : "bg-white/10"}`}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9a9490]">
                    Step 2
                  </p>
                  <p className="font-medium">Payment</p>
                </div>
              </div>
            </div>

            {step === "shipping" ? (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <h2 className="text-2xl font-serif font-bold mb-6">
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.fullName}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingData.email}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          email: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingData.phone}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                      placeholder="+44 123 456 7890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country
                    </label>
                    <select
                      value={shippingData.country}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          country: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.address}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          address: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.city}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          city: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                      placeholder="London"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.postalCode}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                      placeholder="SW1A 1AA"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="flex items-center gap-2 text-[#c9a96e] hover:text-white transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to Cart
                  </button>

                  <button
                    type="submit"
                    className="bg-[#c9a96e] text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold">
                    Payment Details
                  </h2>
                  <button
                    onClick={() => setStep("shipping")}
                    className="text-[#c9a96e] hover:text-white transition-colors text-sm"
                  >
                    Edit Shipping
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 mb-6">
                  <h3 className="font-medium mb-4">Shipping to</h3>
                  <p className="text-[#9a9490]">
                    {shippingData.fullName}
                    <br />
                    {shippingData.address}
                    <br />
                    {shippingData.city}, {shippingData.postalCode}
                    <br />
                    {shippingData.country}
                    <br />
                    {shippingData.phone}
                    <br />
                    {shippingData.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="bg-white/5 border border-white/10 p-6">
                    <PaymentElement />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between pt-6">
                    <button
                      onClick={() => setStep("shipping")}
                      className="flex items-center gap-2 text-[#c9a96e] hover:text-white transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Back to Shipping
                    </button>

                    <button
                      onClick={processCheckout}
                      disabled={isProcessing}
                      className="bg-[#c9a96e] text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Pay £${orderTotal.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white/5 border border-white/10 p-6 sticky top-6">
              <h2 className="text-xl font-serif font-bold mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.product_type}`}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[#9a9490]">
                        {item.product_type === "CUSTOM"
                          ? "Custom Suit"
                          : "Standard"}
                        {item.quantity > 1 && ` × ${item.quantity}`}
                      </p>
                    </div>
                    <p className="font-mono">
                      £{((item.totalPrice * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#9a9490]">Subtotal</span>
                  <span className="font-mono">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9a9490]">Shipping</span>
                  <span className="font-mono">
                    {shippingCostInPounds > 0
                      ? `£${shippingCostInPounds.toFixed(2)}`
                      : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9a9490]">Tax</span>
                  <span className="font-mono">£{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="font-mono">£{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
