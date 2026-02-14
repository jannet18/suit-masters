// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { SubmitHandler, useForm } from "react-hook-form";
// // import { useRouter } from "next/navigation";
// // import InputField from "./common/InputField";
// // import { ShippingFormData, shippingFormSchema } from "../lib/form";

// // const ShippingForm = ({
// //   setShippingForm,
// // }: {
// //   setShippingForm: (data: ShippingFormData) => void;
// // }) => {
// //   const {
// //     register,
// //     handleSubmit,
// //     formState: { errors },
// //   } = useForm<ShippingFormData>({
// //     resolver: zodResolver(shippingFormSchema),
// //   });

// //   const router = useRouter();
// //   const handleShippingForm: SubmitHandler<ShippingFormData> = (
// //     data: ShippingFormData,
// //   ) => {
// //     // console.log("Shipping Form Data:", data);
// //     setShippingForm(data);
// //     router.push("/cart?step=3");
// //   };
// //   return (
// //     <form
// //       onSubmit={handleSubmit(handleShippingForm)}
// //       className="flex flex-col gap-4"
// //     >
// //       <InputField
// //         label="Name"
// //         id="name"
// //         placeholder="John Doe"
// //         register={register}
// //         error={errors.name}
// //       />
// //       <InputField
// //         label="Email"
// //         id="email"
// //         placeholder="johndoe@gmail.com"
// //         register={register}
// //         error={errors.email}
// //       />
// //       <InputField
// //         label="AddressLine1"
// //         id="text"
// //         placeholder=""
// //         type="text"
// //         register={register}
// //         error={errors.phone}
// //       />
// //       <InputField
// //         label="City"
// //         id="text"
// //         placeholder=""
// //         type="text"
// //         register={register}
// //         error={errors.phone}
// //       />
// //       <InputField
// //         label="Region"
// //         id="text"
// //         placeholder=""
// //         type="text"
// //         register={register}
// //         error={errors.phone}
// //       />
// //       <InputField
// //         label="Postal Code"
// //         id="postalCode"
// //         placeholder=""
// //         type="number"
// //         register={register}
// //         error={errors.phone}
// //       />
// //       <InputField
// //         label="Country"
// //         id="phone"
// //         placeholder=""
// //         type="number"
// //         register={register}
// //         error={errors.phone}
// //       />
// //       <button type="submit" className="...">
// //         Continue
// //       </button>
// //     </form>
// //   );
// // };

// // export default ShippingForm;
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Elements } from "@stripe/react-stripe-js";
// import { getCurrentUser } from "../lib/auth";
// import PaymentForm from "./PaymentForm";
// import { getStripe } from "../lib/stripe";
// // import { stripePromise } from "@/lib/stripe";
// // import ShippingForm from "@/components/ShippingForm";
// // import PaymentForm from "@/components/PaymentForm";
// // import { getCurrentUser } from "@/lib/auth";

// export default function CheckoutPage() {
//   const [orderId, setOrderId] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // 🔐 LOGIN GUARD
//   useEffect(() => {
//     getCurrentUser().then((user) => {
//       if (!user) {
//         router.push("/login?redirect=/checkout");
//       } else {
//         setLoading(false);
//       }
//     });
//   }, []);

//   if (loading) return <p>Checking session...</p>;

//   return (
//     <div className="max-w-md mx-auto p-6 space-y-8">
//       <h1 className="text-2xl font-bold">Checkout</h1>

//       {!orderId && (
//         <ShippingForm
//           onSuccess={(id: number) => {
//             setOrderId(id);
//           }}
//         />
//       )}

//       {orderId && (
//         <Elements stripe={getStripe}>
//           <PaymentForm orderId={orderId} />
//         </Elements>
//       )}
//     </div>
//   );
// }
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { ShippingFormData, shippingFormSchema } from "../lib/form";
import { useState } from "react";
import { createOrder } from "../lib/api/orders";
import InputField from "./common/InputField";

interface ShippingFormProps {
  onSuccess: (orderId: number) => void;
}

export default function ShippingForm({ onSuccess }: ShippingFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingFormSchema),
  });

  const handleShippingForm: SubmitHandler<ShippingFormData> = async (data) => {
    setLoading(true);

    try {
      const orderId = await createOrder(data);
      onSuccess(orderId);
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(handleShippingForm)}
      className="flex flex-col gap-4"
    >
      <InputField
        label="Name"
        id="name"
        register={register}
        error={errors.name}
      />
      <InputField
        label="Email"
        id="email"
        register={register}
        error={errors.email}
      />
      <InputField
        label="Phone"
        id="phone"
        register={register}
        error={errors.phone}
      />
      <InputField
        label="Address Line 1"
        id="address_line1"
        register={register}
        error={errors.address_line1}
      />
      <InputField
        label="Address Line 2"
        id="address_line2"
        register={register}
        error={errors.address_line2}
      />
      <InputField
        label="City"
        id="city"
        register={register}
        error={errors.city}
      />
      <InputField
        label="Region"
        id="region"
        register={register}
        error={errors.region}
      />
      <InputField
        label="Postal Code"
        id="postal_code"
        type="text"
        register={register}
        error={errors.postal_code}
      />
      <InputField
        label="Country"
        id="country"
        type="text"
        register={register}
        error={errors.country}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white py-2 rounded-lg"
      >
        {loading ? "Creating Order..." : "Continue to Payment"}
      </button>
    </form>
  );
}
