"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Check, X } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { Button } from "@/app/components/ui/button";
import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthField } from "@/app/components/auth/AuthField";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-foreground" : "text-muted-foreground"}`}>
      {met ? <Check size={12} /> : <X size={12} />}
      {label}
    </li>
  );
}

export default function AdminRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

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
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const { error: signUpError } = await authClient.signUp.email({ name, email, password });

    if (signUpError) {
      setIsSubmitting(false);
      setFormError(signUpError.message || "Could not create account");
      return;
    }

    // New accounts start as CUSTOMER — only an existing admin can grant
    // ADMIN access (see apps/admin/app/users). Sign straight back out so we
    // don't leave a half-authenticated, role-insufficient session sitting in
    // the admin app's cookies.
    await authClient.signOut();
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthCard
        title="Account requested"
        description="One more step before you can sign in."
      >
        <p className="text-sm text-muted-foreground mb-4">
          Your account has been created, but it doesn&apos;t have admin access yet. Ask an
          existing administrator to grant it from <span className="text-foreground">Users</span> — you&apos;ll be
          able to sign in as soon as they do.
        </p>
        <Link href="/login" className="text-sm text-foreground underline underline-offset-4">
          ← Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Request an account"
      description="Create your credentials. An administrator still needs to grant you access."
      footer={
        <p className="text-sm text-muted-foreground text-center">
          Already have access?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Sign in
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
      </form>
    </AuthCard>
  );
}
