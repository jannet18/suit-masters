import { zodResolver } from "@hookform/resolvers/zod";

import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "./common/InputField";
import { ShippingFormData, shippingFormSchema } from "../lib/form";

const ShippingForm = ({
  setShippingForm,
}: {
  setShippingForm: (data: ShippingFormData) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingFormSchema),
  });

  const router = useRouter();
  const handleShippingForm: SubmitHandler<ShippingFormData> = (
    data: ShippingFormData,
  ) => {
    // console.log("Shipping Form Data:", data);
    setShippingForm(data);
    router.push("/cart?step=3");
  };
  return (
    <form
      onSubmit={handleSubmit(handleShippingForm)}
      className="flex flex-col gap-4"
    >
      <InputField
        label="Name"
        id="name"
        placeholder="John Doe"
        register={register}
        error={errors.name}
      />
      <InputField
        label="Email"
        id="email"
        placeholder="johndoe@gmail.com"
        register={register}
        error={errors.email}
      />
      <InputField
        label="Phone"
        id="phone"
        placeholder="0722000000"
        type="number"
        register={register}
        error={errors.phone}
      />
      ...
      <button type="submit" className="...">
        Continue
      </button>
    </form>
  );
};

export default ShippingForm;
