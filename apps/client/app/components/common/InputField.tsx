import { FieldError, UseFormRegister } from "react-hook-form";

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
}

const InputField = ({
  label,
  id,
  type = "text",
  placeholder,
  error,
  register,
}: InputFieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-xs text-gray-500 font-medium">
      {label}
    </label>
    <input
      className="border-b border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
      type={type}
      id={id}
      placeholder={placeholder}
      {...register(id)}
    />
    {error && <p className="text-xs text-red-600">{error.message}</p>}
  </div>
);

export default InputField;
