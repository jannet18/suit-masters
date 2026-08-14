"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await signUp.email({ name, email, password });

    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError.message || "Unable to register. Please try again.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-medium text-[#f5f0eb] mb-6">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[#9a9490] mb-1" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 text-[#f5f0eb] focus:outline-none focus:border-[#c9a96e]/50"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2 text-[#f5f0eb] focus:outline-none focus:border-[#c9a96e]/50"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-[#9a9490] mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[#c9a96e] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
