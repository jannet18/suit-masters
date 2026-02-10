import { zodResolver } from "@hookform/resolvers/zod";
import {
  PaymentFormData,
  paymentFormSchema,
  ShippingFormData,
  shippingFormSchema,
} from "../lib/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useRouter } from "next/router";
import Image from "next/image";

const PaymentForm = ({
  setPaymentForm,
}: {
  setPaymentForm: (data: PaymentFormData) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  });

  const router = useRouter();
  const handlePaymentForm: SubmitHandler<PaymentFormData> = (
    data: PaymentFormData,
  ) => {
    setPaymentForm(data);
    router.push("/cart?step=4");
  };
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handlePaymentForm)}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-xs text-gray-500 font-medium">
          Card Name
        </label>
        <input
          className="border-b border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          type="text"
          id="cardName"
          placeholder="John Doe"
          {...register("cardName")}
        />
        {/* {errors.cardName && (
          <p className="text-xs text-red-600">{errors.cardName.message}</p>
        )} */}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs text-gray-500 font-medium">
          Card Number
        </label>
        <input
          className="border-b border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          type="text"
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          {...register("cardNumber")}
        />
        {errors.cardNumber && (
          <p className="text-xs text-red-600">{errors.cardNumber.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="expiryDate"
          className="text-xs text-gray-500 font-medium"
        >
          Expiry Date
        </label>
        <input
          className="border-b border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          type="text"
          id="expiryDate"
          placeholder="MM/YY"
          {...register("expiryDate")}
        />
        {errors.expiryDate && (
          <p className="text-xs text-red-600">{errors.expiryDate.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="cvv" className="text-xs text-gray-500 font-medium">
          CVV
        </label>
        <input
          className="border-b border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          type="text"
          id="cvv"
          placeholder=""
          {...register("cvv")}
        />
        {errors.cvv && (
          <p className="text-xs text-red-600">{errors.cvv.message}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Image
          src="/images/payment-methods.png"
          alt="Payment Methods"
          width={100}
          height={30}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gray-800 text-white p-2 rounded-lg cursor-pointer gap-2 hover:bg-gray-900 transition-all duration-300"
      >
        Checkout <ShoppingCart className="w-3 h-3" />
      </button>
    </form>
  );
};

export default PaymentForm;
