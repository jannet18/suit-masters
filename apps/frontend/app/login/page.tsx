"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@repo/auth/client";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthField } from "../components/auth/AuthField";

// Only same-site paths: "/orders" is fine, "https://evil.site" or
// "//evil.site" would turn the login page into an open redirect.
function safeRedirect(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

// useSearchParams() must sit under a Suspense boundary or Next.js fails the
// production build when it prerenders this page.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageForm />
    </Suspense>
  );
}

function LoginPageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirect(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    setIsSubmitting(false);

    if (signInError) {
      toast.error(signInError.message || "Invalid email or password");
      return;
    }

    toast.success("Welcome back.");
    router.push(redirect);
    router.refresh();
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Access your orders, fittings, and exclusive member benefits."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-[#9a9490] hover:text-[#c9a96e] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-sm text-[#9a9490] text-center pt-2">
          New to Suit Masters?{" "}
          <Link href="/register" className="text-[#c9a96e] hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
