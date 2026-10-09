"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@repo/auth/client";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthField } from "../components/auth/AuthField";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-[#c9a96e]" : "text-[#9a9490]"}`}>
      {met ? <Check size={12} /> : <X size={12} />}
      {label}
    </li>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const validate = () => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
    if (!hasMinLength || !hasNumber) errors.password = "Password doesn't meet the requirements";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });
    setIsSubmitting(false);

    if (signUpError) {
      toast.error(signUpError.message || "Could not create account");
      return;
    }

    toast.success("Account created. Welcome to Suit Masters.");
    router.push("/");
    router.refresh();
  };

  return (
    <AuthLayout
      eyebrow="Join us"
      title="Create account"
      subtitle="Join the Suit Masters inner circle and unlock exclusive benefits."
      showBenefits
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          label="Full name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
        />

        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <div>
          <AuthField
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          {password.length > 0 && (
            <ul className="mt-2 flex gap-4">
              <PasswordRequirement met={hasMinLength} label="8+ characters" />
              <PasswordRequirement met={hasNumber} label="A number" />
            </ul>
          )}
        </div>

        <AuthField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          className={
            confirmPassword.length > 0 && !fieldErrors.confirmPassword
              ? passwordsMatch
                ? "border-green-700/60"
                : undefined
              : undefined
          }
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-sm text-[#9a9490] text-center pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-[#c9a96e] hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-xs text-[#6b6662] text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
