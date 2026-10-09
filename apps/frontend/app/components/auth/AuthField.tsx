"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
}

/** A labeled input; password fields get a show/hide toggle automatically. */
export function AuthField({ label, error, type, className, ...props }: AuthFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="block text-sm text-[#9a9490] mb-1" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={!!error}
          className={`w-full rounded-md bg-[#0f0f0f] border px-3 py-2 text-[#f5f0eb] focus:outline-none transition-colors ${
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-[#2e2e2e] focus:border-[#c9a96e]"
          } ${isPassword ? "pr-10" : ""} ${className ?? ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9490] hover:text-[#f5f0eb] transition-colors"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
