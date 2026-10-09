"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@repo/auth/client";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthField } from "../components/auth/AuthField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setIsSubmitting(false);

    if (requestError) {
      toast.error(requestError.message || "Something went wrong");
      return;
    }

    // Always show success, whether or not the email exists — don't let this
    // endpoint be used to enumerate registered accounts.
    setSent(true);
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot password"
      subtitle="We'll email you a link to reset it."
    >
      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-[#f5f0eb] bg-[#161616] border border-[#2e2e2e] rounded-lg p-4">
            If an account exists for <span className="text-[#c9a96e]">{email}</span>, you'll
            receive a password reset link shortly.
          </p>
          <Link href="/login" className="text-sm text-[#c9a96e] hover:underline">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <p className="text-sm text-[#9a9490] text-center pt-2">
            <Link href="/login" className="text-[#c9a96e] hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
