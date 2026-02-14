// // "use client";

// // import { useState } from "react";
// // import ShippingForm from "../components/ShippingForm";
// // import { Elements } from "@stripe/react-stripe-js";
// // import PaymentForm from "../components/PaymentForm";
// // import { getStripe } from "../lib/stripe";

// // export default function CheckoutPage() {
// //   const [orderId, setOrderId] = useState<number | null>(null);

// //   return (
// //     <div className="max-w-md mx-auto p-6 space-y-8">
// //       <h1 className="text-2xl font-bold">Checkout</h1>

// //       {/* STEP 1: Shipping + Order creation */}
// //       {!orderId && (
// //         <ShippingForm
// //         // onSuccess={(createdOrderId: number) => {
// //         //   setOrderId(createdOrderId);
// //         // }}
// //         />
// //       )}

// //       {/* STEP 2: Payment */}
// //       {orderId && (
// //         <Elements stripe={getStripe}>
// //           <PaymentForm orderId={orderId} />
// //         </Elements>
// //       )}
// //     </div>
// //   );
// // }

// import { zodResolver } from "@hookform/resolvers/zod";

// import { SubmitHandler, useForm } from "react-hook-form";
// import { useRouter } from "next/navigation";
// import { ShippingFormData, shippingFormSchema } from "../lib/form";
// import InputField from "../components/common/InputField";

// const ShippingForm = ({
//   setShippingForm,
// }: {
//   setShippingForm: (data: ShippingFormData) => void;
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ShippingFormData>({
//     resolver: zodResolver(shippingFormSchema),
//   });

//   const router = useRouter();
//   const handleShippingForm: SubmitHandler<ShippingFormData> = (
//     data: ShippingFormData,
//   ) => {
//     // console.log("Shipping Form Data:", data);
//     setShippingForm(data);
//     router.push("/cart?step=3");
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(handleShippingForm)}
//       className="flex flex-col gap-4"
//     >
//       <InputField
//         label="Name"
//         id="name"
//         placeholder="John Doe"
//         register={register}
//         error={errors.name}
//       />
//       <InputField
//         label="Email"
//         id="email"
//         placeholder="johndoe@gmail.com"
//         register={register}
//         error={errors.email}
//       />
//       <InputField
//         label="AddressLine1"
//         id="text"
//         placeholder=""
//         type="text"
//         register={register}
//         error={errors.phone}
//       />
//       <InputField
//         label="City"
//         id="text"
//         placeholder=""
//         type="text"
//         register={register}
//         error={errors.phone}
//       />{" "}
//       <InputField
//         label="Region"
//         id="text"
//         placeholder=""
//         type="text"
//         register={register}
//         error={errors.phone}
//       />{" "}
//       <InputField
//         label="Postal Code"
//         id="postalCode"
//         placeholder=""
//         type="number"
//         register={register}
//         error={errors.phone}
//       />
//       <InputField
//         label="Country"
//         id="phone"
//         placeholder=""
//         type="number"
//         register={register}
//         error={errors.phone}
//       />
//       <button type="submit" className="...">
//         Continue
//       </button>
//     </form>
//   );
// };

// export default ShippingForm;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { Elements } from "@stripe/react-stripe-js";
import ShippingForm from "../components/ShippingForm";
import PaymentForm from "../components/PaymentForm";
import { stripePromise } from "../lib/stripe";
// import { getStripe } from "../lib/stripe";

export default function CheckoutPage() {
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔐 LOGIN GUARD
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        router.push("/login?redirect=/checkout");
      } else {
        setLoading(false);
      }
    });
  }, []);

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
