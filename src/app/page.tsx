"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
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
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    setSuccess("Login successful! Redirecting to your dashboard...");
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#0B2340] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[1.05fr_1fr] rounded-lg bg-white border border-[#E4DCC8] overflow-hidden md:min-h-[560px]">

   
        <div className="relative hidden md:flex flex-col justify-between overflow-hidden p-11 bg-white text-[#0B2340] min-h-[560px]">
          <div className="flex items-center gap-2.5 text-xl relative z-10">
            <span className="inline-block w-[9px] h-[9px] rounded-full bg-[#FDB913]" />
            RENEVIEW
          </div>

        
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -right-[70px] -bottom-[70px] size-[260px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#FDB913_0%,#C98A00_55%,transparent_72%)] opacity-90"
            />
          </div>

          <div className="relative z-10 max-w-[340px] -translate-y-6">
            <h1 className="text-4xl leading-snug mb-4">
              <span className="block text-[#0B2340] font-extrabold ">OUR TARGET.</span>
              <span className="block text-[#FDB913] font-extrabold">OUR WIN.</span>
            </h1>
            <p className="text-base font-semibold leading-relaxed text-[#5B6472]">
              &quot;Every action counts. Every conversation matters. Every submission brings us closer to our dreams.&quot;
            </p>
            <p className="mt-4 text-3xl font-semibold italic text-[#0B2340]">
              Let&apos;s do this, Team!
            </p>
          </div>

          <div className="relative z-10 flex gap-6 mt-7 -translate-y-6">
            <div>
              <div className="text-lg text-[#0B2340]">DAILY ACTIONS.</div>
              <div className="text-lg text-[#0B2340]">BIG RESULTS.</div>

            </div>
          </div> 
        </div>

   
        <div className="p-9 md:min-h-[560px] md:p-12 flex flex-col justify-start">
       
          <div className="flex md:hidden items-center gap-2 text-lg mb-6 text-[#0B2340]">
            <span className="inline-block w-[8px] h-[8px] rounded-full bg-[#FDB913]" />
            RENEVIEW
          </div>

          <h1 className="text-5xl mb-2 text-[#0B2340]">Welcome!</h1>
          <p className="text-base text-[#5B6472] mb-8">
            Sign in to continue your insurance licensing journey.
          </p>

          <form className="space-y-[18px]" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#10151F] mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-[#A9A092]"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-[#E4DCC8] bg-white text-[#10151F] placeholder-[#A9A092] text-base outline-none transition focus:border-[#0B2340] focus:ring-4 focus:ring-[#0B2340]/10"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#10151F]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#0B2340] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-[#A9A092]"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-[#E4DCC8] bg-white text-[#10151F] placeholder-[#A9A092] text-base outline-none transition focus:border-[#0B2340] focus:ring-4 focus:ring-[#0B2340]/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-[#A9A092] transition hover:text-[#0B2340]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700" role="status">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1.5 flex w-full items-center justify-center gap-2 px-4 py-3.5 text-base bg-[#FDB913] text-[#0B2340] shadow-sm transition-colors hover:bg-[#C98A00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2340] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-8 text-center text-base text-[#5B6472]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#0B2340] font-bold hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}