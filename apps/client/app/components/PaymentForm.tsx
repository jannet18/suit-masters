// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import InputField from "./common/InputField";
// import { PaymentFormData, paymentFormSchema } from "../lib/form";
// import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
// import { useState } from "react";
// import { createPaymentIntent } from "../lib/api/orders";

// interface PaymentFormProps {
//   onSubmit: (data: PaymentFormData) => void;
//   orderId: number;
// }

// const PaymentForm = ({ onSubmit }: PaymentFormProps) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<PaymentFormData>({
//     resolver: zodResolver(paymentFormSchema),
//   });
//   const stripe = useStripe();
//   const elements = useElements();
//   const [loading, setLoading] = useState(false);

//   const handlePayment = async () => {
//     if (!stripe || !elements) return;
//     setLoading(true);

//     try {
//       const clientSecret = await createPaymentIntent(orderId);
//       const { error } = await stripe.confirmCardPayment(clientSecret, {
//         payment_method: {
//           card: elements.getElement(CardElement),
//         },
//       });
//       if (error) {
//         console.log(error.message);
//       } else {
//         console.log("Payment successful 🎉");
//       }
//     } catch (err: any) {
//       console.log(err.message);
//     }

//     setLoading(false);
//   };
//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md"
//     >
//       <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>

//       <InputField
//         label="Name on Card"
//         id="cardName"
//         placeholder="John Doe"
//         register={register}
//         error={errors.cardName}
//       />

//       <InputField
//         label="Card Number"
//         id="cardNumber"
//         placeholder="1234 5678 9012 3456"
//         register={register}
//         error={errors.cardNumber}
//       />

//       <div className="flex gap-4">
//         <div className="flex-1">
//           <InputField
//             label="Expiry (MM/YY)"
//             id="expiry"
//             placeholder="12/27"
//             register={register}
//             error={errors.expiry}
//           />
//         </div>

//         <div className="flex-1">
//           <InputField
//             label="CVV"
//             id="cvv"
//             type="password"
//             placeholder="123"
//             register={register}
//             error={errors.cvv}
//           />
//         </div>
//       </div>

//       <button
//         type="submit"
//         disabled={loading}
//         className="mt-4 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition"
//       >
//         {loading ? "Processing..." : "Pay Now"}
//       </button>
//     </form>
//   );
// };

// export default PaymentForm;

"use client";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { createPaymentIntent } from "../lib/api/orders";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface PaymentFormProps {
  orderId: number;
}

const PaymentForm = ({ orderId }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Ask backend to create PaymentIntent
      const clientSecret = await createPaymentIntent(orderId);

      // 2️⃣ Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        toast.error("Payment failed");
      } else if (result.paymentIntent?.status === "succeeded") {
        // alert("Payment successful 🎉");
        // TODO: redirect to success page
        router.push(`/checkout/success?orderId=${orderId}`);
        toast.success("Payment Successful 🎉");
      }
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handlePayment}
      className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md"
    >
      <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>

      {/* ✅ Stripe-secure card input */}
      <div className="border rounded-lg p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1f2937",
                "::placeholder": { color: "#9ca3af" },
              },
            },
          }}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="mt-4 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default PaymentForm;
