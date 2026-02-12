"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "./common/InputField";
import { PaymentFormData, paymentFormSchema } from "../lib/form";

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
}

const PaymentForm = ({ onSubmit }: PaymentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md"
    >
      <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>

      <InputField
        label="Name on Card"
        id="cardName"
        placeholder="John Doe"
        register={register}
        error={errors.cardName}
      />

      <InputField
        label="Card Number"
        id="cardNumber"
        placeholder="1234 5678 9012 3456"
        register={register}
        error={errors.cardNumber}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <InputField
            label="Expiry (MM/YY)"
            id="expiry"
            placeholder="12/27"
            register={register}
            error={errors.expiry}
          />
        </div>

        <div className="flex-1">
          <InputField
            label="CVV"
            id="cvv"
            type="password"
            placeholder="123"
            register={register}
            error={errors.cvv}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition"
      >
        Pay Now
      </button>
    </form>
  );
};

export default PaymentForm;
