"use client";

import { AuthShell } from "@/components/ui/auth-shell";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setMessage(data.message);
      setTimeout(() => router.replace("/"), 1800);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell
        title="Link not valid"
        subtitle="This page needs a reset link to work."
        footer={
          <Link
            href="/forgot-password"
            className="font-bold text-[#0B2340] hover:underline"
          >
            Request a new reset link
          </Link>
        }
      >
        <p className="text-sm text-[#5B6472]">
          Open the reset link from your email, or request a fresh one.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a password you haven't used before. It needs at least 8 characters."
      footer={
        <span className="text-[#5B6472]">
          Changed your mind?{" "}
          <Link href="/" className="font-bold text-[#0B2340] hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-[18px]" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-semibold text-[#10151F]"
          >
            New password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-[#A9A092]"
              aria-hidden="true"
            />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              className="block w-full border border-[#E4DCC8] bg-white py-3 pl-10 pr-10 text-base text-[#10151F] outline-none transition placeholder:text-[#A9A092] focus:border-[#0B2340] focus:ring-4 focus:ring-[#0B2340]/10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3.5 flex items-center text-[#A9A092] transition hover:text-[#0B2340]"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="mb-1.5 block text-sm font-semibold text-[#10151F]"
          >
            Confirm new password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-[#A9A092]"
              aria-hidden="true"
            />
            <input
              type={showPassword ? "text" : "password"}
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              className="block w-full border border-[#E4DCC8] bg-white py-3 pl-10 pr-3 text-base text-[#10151F] outline-none transition placeholder:text-[#A9A092] focus:border-[#0B2340] focus:ring-4 focus:ring-[#0B2340]/10"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-700" role="status">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || Boolean(message)}
          className="mt-1.5 flex w-full items-center justify-center gap-2 bg-[#FDB913] px-4 py-3.5 text-base font-semibold text-[#0B2340] shadow-sm transition-colors hover:bg-[#C98A00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2340] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {isSubmitting ? "Saving..." : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Set a new password" subtitle="Loading…">
          <p className="text-sm text-[#5B6472]">One moment…</p>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
