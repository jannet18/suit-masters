"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { Button } from "@/app/components/ui/button";
import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthField } from "@/app/components/auth/AuthField";

// Only same-site paths: "/orders" is fine, "https://evil.site" or
// "//evil.site" would turn the login page into an open redirect.
function safeRedirect(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

// useSearchParams() must sit under a Suspense boundary or Next.js fails the
// production build when it prerenders this page.
export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginPageForm />
    </Suspense>
  );
}

function AdminLoginPageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirect(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setIsSubmitting(false);
      setFormError(signInError.message || "Invalid email or password");
      return;
    }

    if (data?.user && (data.user as { roles?: string }).roles !== "ADMIN") {
      await authClient.signOut();
      setIsSubmitting(false);
      setFormError("This account does not have admin access.");
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <AuthCard
      title="Sign in"
      description="Sign in with your administrator account."
      footer={
        <p className="text-sm text-muted-foreground text-center flex items-center gap-1">
          Need access?{" "}
          <Link href="/register" className="text-foreground underline underline-offset-4">
            Request an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {formError}
          </p>
        )}

        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

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
      </form>
    </AuthCard>
  );
}
