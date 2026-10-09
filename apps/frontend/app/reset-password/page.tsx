"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@repo/auth/client";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthField } from "../components/auth/AuthField";

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-[#c9a96e]" : "text-[#9a9490]"}`}>
      {met ? <Check size={12} /> : <X size={12} />}
      {label}
    </li>
  );
}

// useSearchParams() must sit under a Suspense boundary or Next.js fails the
// production build when it prerenders this page.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Account recovery"
        title="Reset password"
        subtitle="This link is invalid or has expired."
      >
        <Link href="/forgot-password" className="text-sm text-[#c9a96e] hover:underline">
          Request a new link →
        </Link>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLength || !hasNumber) {
      setError("Password doesn't meet the requirements");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setIsSubmitting(false);

    if (resetError) {
      toast.error(resetError.message || "This link is invalid or has expired");
      return;
    }

    toast.success("Password reset. Sign in with your new password.");
    router.push("/login");
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset password"
      subtitle="Choose a new password for your account."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <AuthField
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && (
            <ul className="mt-2 flex gap-4">
              <PasswordRequirement met={hasMinLength} label="8+ characters" />
              <PasswordRequirement met={hasNumber} label="A number" />
            </ul>
          )}
        </div>

        <AuthField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={error ?? undefined}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
