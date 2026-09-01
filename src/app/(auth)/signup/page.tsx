"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(
        data.error ?? "Unable to create your account. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }
    const signInResult = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (signInResult?.error) {
      setError("Signup succeeded, but automatic login failed. Please log in manually.");
      return;
    }

    setSuccess("Account created successfully! Redirecting to your dashboard...");
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1000);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#061927] px-4 py-8 font-sans">
      <div className="mb-8 text-center">
        <h1 className="mb-1 text-4xl font-extrabold tracking-wide text-[#7fc4f5]">
          RENEVIEW
        </h1>
        <p className="text-xs text-gray-300">Insurance Licensing Journey</p>
      </div>
      <div className="w-full max-w-sm rounded-xl bg-[#0c2a41] p-8 shadow-xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          Create your account
        </h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Field
            id="name"
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            icon={<UserRound className="size-4" />}
          />
          <Field
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            icon={<Mail className="size-4" />}
          />
          <Field
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            icon={<LockKeyhole className="size-4" />}
            trailingAction={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex items-center justify-center text-gray-400 transition hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
          {error && (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-300" role="status">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center rounded-md bg-[#f8d46a] px-4 py-2.5 text-sm font-bold text-[#061927] shadow-sm transition-colors hover:bg-[#eabb4c] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 size-4" />
            )}
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-8 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/" className="font-semibold text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  icon,
  trailingAction,
  ...inputProps
}: React.ComponentProps<"input"> & {
  id: string;
  label: string;
  icon: React.ReactNode;
  trailingAction?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400"
      >
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center justify-center text-gray-400"
          aria-hidden="true"
        >
          {icon}
        </span>
        <input
          id={id}
          name={id}
          required
          className="block w-full rounded-md border border-transparent bg-[#061927] py-2.5 pr-10 pl-9 text-sm text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-[#7fc4f5] focus:outline-none"
          {...inputProps}
        />
        {trailingAction && (
          <span className="absolute inset-y-0 right-3 flex items-center justify-center">
            {trailingAction}
          </span>
        )}
      </div>
    </div>
  );
}
