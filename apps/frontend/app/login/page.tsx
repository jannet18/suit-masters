"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CLIENTS } from "@/lib/api/api-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || `${CLIENTS.admin}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn.email({ email, password });

    setIsSubmitting(false);
    if (signInError) {
      setError(signInError.message || "Unable to sign in. Please try again.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-medium text-[#f5f0eb] mb-6">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[#9a9490] mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 text-[#f5f0eb] focus:outline-none focus:border-[#c9a96e]/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#9a9490] mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 text-[#f5f0eb] focus:outline-none focus:border-[#c9a96e]/50"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="text-sm text-[#9a9490] mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#c9a96e] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
