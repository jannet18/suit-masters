"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { v4 as uuidv4 } from "uuid";
import { stripePromise } from "../../lib/stripe";
import { useCartStore } from "../stores/useCartStore";
import { SHIPPING_COUNTRIES, formatCurrency } from "@repo/pricing";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Package,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useSession } from "@repo/auth/client";
import PaymentForm from "../components/common/PaymentForm";
import { ErrorBoundary } from "../components/ErrorBoundary";

/** Server-computed price for the bag, all integer pence; what checkout shows is what is charged. */
interface CheckoutQuote {
  isExport: boolean;
  subtotal: number;
  discount: number;
  shipping: number;
  exportVatRelief: number;
  vatIncluded: number;
  total: number;
  lines: Array<{
    productId: number;
    name: string;
    quantity: number;
    lineTotal: number;
  }>;
}

/** Client-side validation for shipping form fields */
function validateShipping(data: {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}): string[] {
  const errors: string[] = [];
  if (!data.fullName.trim()) errors.push("Full name is required");
  if (data.fullName.length > 255)
    errors.push("Full name must be under 255 characters");
  if (!/^[a-zA-Z\s\-'.]+$/.test(data.fullName))
    errors.push("Full name contains invalid characters");

  if (!data.email.trim()) errors.push("Email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("Invalid email address");

  if (!data.phone.trim()) errors.push("Phone number is required");
  if (!/^[\+]?[\d\s\-\(\)]+$/.test(data.phone))
    errors.push("Phone number contains invalid characters");

  if (!data.address.trim()) errors.push("Address is required");
  if (!data.city.trim()) errors.push("City is required");
  if (!data.postalCode.trim()) errors.push("Postal code is required");
  if (!data.country.trim()) errors.push("Country is required");

  return errors;
}

function CheckoutClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending: isLoading } = useSession();
  const user = session?.user ?? null;
  const isAuthenticated = !isLoading && !!session;
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { cart } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // What the shopper chose, without prices: the server prices it from the
  // catalogue so a tampered cart can't change what is charged.
  const checkoutItems = useMemo(
    () =>
      cart.map((item) => ({
        productId: Number(item.productId ?? item.id),
        quantity: item.quantity,
        selections: (item.selectedOptions ?? [])
          .map((opt) => opt.label)
          .filter(Boolean),
        ...(item.productType === "CUSTOM" && item.configuration?.measurements
          ? { measurements: item.configuration.measurements }
          : {}),
      })),
    [cart],
  );

  // One idempotency key per distinct checkout: resubmitting the same bag and
  // details returns the same order instead of reserving stock twice.
  const checkoutFingerprint = JSON.stringify([
    checkoutItems,
    shippingData,
    promoCode,
  ]);
  const idempotencyKey = useMemo(() => uuidv4(), [checkoutFingerprint]);

  useEffect(() => {
    if (checkoutItems.length === 0) return;
    const controller = new AbortController();
    setQuoting(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/orders/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: checkoutItems,
            country: shippingData.country,
            promoCode: promoCode || undefined,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setQuote(null);
          setQuoteError(data.error || "We couldn't price your bag");
          return;
        }
        setQuote(data.quote);
        setQuoteError(null);
        if (data.promoError) {
          setPromoError(data.promoError);
          setPromoCode("");
        }
      } catch (err: any) {
        if (err.name !== "AbortError")
          setQuoteError("We couldn't price your bag");
      } finally {
        if (!controller.signal.aborted) setQuoting(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [checkoutItems, shippingData.country, promoCode]);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError(null);
    setPromoCode(code);
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoInput("");
    setPromoError(null);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
    if (user) {
      setShippingData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0 && isAuthenticated) {
      router.push("/cart");
    }
  }, [cart, isAuthenticated, router]);

  const handleShippingSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const errors = validateShipping(shippingData);

    if (errors.length) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setError(null);
    setCreatingPayment(true);

    try {
      // Create Order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          shipping: shippingData,
          items: checkoutItems,
          promoCode: promoCode || undefined,
          expectedTotal: quote?.total,
        }),
      });

      const order = await orderResponse.json();

      if (order.code === "PRICE_CHANGED" && order.quote) {
        setQuote(order.quote);
      }
      if (order.error) {
        throw new Error(order.error);
      }

      setOrderId(order.orderId);

      // Fully covered by a voucher: nothing to pay
      if (order.requiresPayment === false) {
        router.push(`/order-confirmation?id=${order.orderId}`);
        return;
      }

      // Create PaymentIntent (amount comes from the stored order)
      const paymentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.orderId }),
      });

      const payment = await paymentResponse.json();

      if (payment.error) {
        throw new Error(payment.error);
      }

      setClientSecret(payment.clientSecret);

      setStep("payment");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingPayment(false);
    }
  };

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#c9a96e] mx-auto mb-4" />
          <p className="text-[#f5f0eb]">Loading...</p>
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold sm:text-4xl">Checkout</h1>

        <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Left Column - Forms */}
          <div className="min-w-0 lg:w-2/3">
            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-between gap-2 sm:mb-12 sm:gap-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-[#c9a96e] text-black" : "bg-white/10"}`}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9a9490]">
                    Step 1
                  </p>
                  <p className="text-xs font-medium sm:text-base">Shipping Details</p>
                </div>
              </div>

              <div className="h-px min-w-3 flex-1 bg-white/10 sm:max-w-12" />

              <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step === "payment" ? "bg-[#c9a96e] text-black" : "bg-white/10"}`}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9a9490]">
                    Step 2
                  </p>
                  <p className="text-xs font-medium sm:text-base">Payment</p>
                </div>
              </div>
            </div>

            {step === "shipping" ? (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <h2 className="text-2xl font-serif font-bold mb-6">
                  Shipping Information
                </h2>

                {validationErrors.length > 0 && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-red-400" />
                      <p className="text-red-300 font-medium text-sm">
                        Please fix the following errors:
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-2"
                  >
                    <AlertCircle
                      size={16}
                      className="text-red-400 mt-0.5 shrink-0"
                    />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="shipping-fullName"
                      className="block text-sm font-medium mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="shipping-fullName"
                      autoComplete="name"
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
                    <label
                      htmlFor="shipping-email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="shipping-email"
                      autoComplete="email"
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
                    <label
                      htmlFor="shipping-phone"
                      className="block text-sm font-medium mb-2"
                    >
                      Phone
                    </label>
                    <input
                      id="shipping-phone"
                      autoComplete="tel"
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
                    <label
                      htmlFor="shipping-country"
                      className="block text-sm font-medium mb-2"
                    >
                      Country
                    </label>
                    <select
                      id="shipping-country"
                      autoComplete="country-name"
                      value={shippingData.country}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          country: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-[#c9a96e]"
                    >
                      {SHIPPING_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="shipping-address"
                      className="block text-sm font-medium mb-2"
                    >
                      Address
                    </label>
                    <input
                      id="shipping-address"
                      autoComplete="street-address"
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
                    <label
                      htmlFor="shipping-city"
                      className="block text-sm font-medium mb-2"
                    >
                      City
                    </label>
                    <input
                      id="shipping-city"
                      autoComplete="address-level2"
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
                    <label
                      htmlFor="shipping-postalCode"
                      className="block text-sm font-medium mb-2"
                    >
                      Postal Code
                    </label>
                    <input
                      id="shipping-postalCode"
                      autoComplete="postal-code"
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

                <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
                    disabled={creatingPayment || quoting || !quote}
                    className="bg-[#c9a96e] text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Placing order...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
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
                    {clientSecret ? (
                      // If Stripe can't load (blocked script, network), keep the
                      // order and the page; only the payment box shows an error.
                      <ErrorBoundary
                        fallback={
                          <div
                            role="alert"
                            className="py-6 text-center text-sm text-red-300"
                          >
                            We couldn&apos;t load the secure payment form. Your
                            order is saved.{" "}
                            <button
                              type="button"
                              onClick={() => window.location.reload()}
                              className="underline text-[#c9a96e]"
                            >
                              Try again
                            </button>
                          </div>
                        }
                      >
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret,
                            appearance: {
                              theme: "night",
                            },
                          }}
                        >
                          <PaymentForm
                            orderId={orderId!}
                            shippingData={shippingData}
                          />
                        </Elements>
                      </ErrorBoundary>
                    ) : (
                      <div className="py-10 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p>Preparing secure payment...</p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4">
                      {error}
                    </div>
                  )}

                  <div className="pt-6">
                    <button
                      onClick={() => setStep("shipping")}
                      className="flex items-center gap-2 text-[#c9a96e] hover:text-white transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Back to Shipping
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="min-w-0 lg:w-1/3">
            <div className="bg-white/5 border border-white/10 p-4 sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-serif font-bold mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item, index) => {
                  const priced = quote?.lines[index];
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex justify-between items-start"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-medium">{item.name}</p>
                        <p className="text-sm text-[#9a9490]">
                          {item.productType === "CUSTOM"
                            ? "Custom Suit"
                            : "Standard"}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                        </p>
                      </div>
                      <p className="shrink-0 font-mono">
                        {priced ? formatCurrency(priced.lineTotal) : "—"}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code */}
              <div className="border-t border-white/10 pt-4 mb-4">
                <label
                  htmlFor="promo"
                  className="block text-sm text-[#9a9490] mb-2"
                >
                  Have a promo code?
                </label>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-green-900/20 border border-green-700 rounded px-3 py-2">
                    <span className="text-green-400 font-mono text-sm font-bold">
                      {promoCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-red-400 text-xs hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id="promo"
                      type="text"
                      value={promoInput}
                      onChange={(e) =>
                        setPromoInput(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleApplyPromo())
                      }
                      placeholder="Enter code"
                      className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#c9a96e]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!promoInput.trim()}
                      className="px-4 py-2 bg-white/10 text-sm hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && (
                  <p role="alert" className="text-red-400 text-xs mt-1">
                    {promoError}
                  </p>
                )}
              </div>

              {quoteError ? (
                <p
                  role="alert"
                  className="border-t border-white/10 pt-4 text-sm text-red-300"
                >
                  {quoteError}
                </p>
              ) : !quote ? (
                <div className="border-t border-white/10 pt-4 flex items-center gap-2 text-sm text-[#9a9490]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Calculating
                  total…
                </div>
              ) : (
                <div
                  className={`border-t border-white/10 pt-4 space-y-3 ${quoting ? "opacity-60" : ""}`}
                >
                  <div className="flex justify-between">
                    <span className="text-[#9a9490]">Subtotal</span>
                    <span className="font-mono">
                      {formatCurrency(quote.subtotal)}
                    </span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({promoCode})</span>
                      <span className="font-mono">
                        -{formatCurrency(quote.discount)}
                      </span>
                    </div>
                  )}
                  {quote.isExport && quote.exportVatRelief > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#9a9490]">
                        UK VAT removed (export)
                      </span>
                      <span className="font-mono">
                        -{formatCurrency(quote.exportVatRelief)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#9a9490]">Shipping</span>
                    <span className="font-mono">
                      {quote.shipping > 0
                        ? formatCurrency(quote.shipping)
                        : "FREE"}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="font-mono">
                      {formatCurrency(quote.total)}
                    </span>
                  </div>
                  <p className="text-xs text-[#9a9490]">
                    {quote.isExport
                      ? "Shipped from the UK without VAT. Import duties and taxes may be charged on delivery."
                      : `Includes ${formatCurrency(quote.vatIncluded)} VAT`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
