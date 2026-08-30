"use client";

import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
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

    router.replace("/dashboard");
    router.refresh();
  }

  return (
   <div className="min-h-screen bg-[#061927] flex flex-col items-center justify-center font-sans px-4">
  
  
  <div className="text-center mb-8">
    <h1 className="text-4xl font-extrabold text-[#7fc4f5] tracking-wide mb-1">RENEVIEW</h1>
    <p className="text-xs text-gray-300">Insurance Licensing Journey</p>
  </div>

  
  <div className="bg-[#0c2a41] w-full max-w-sm rounded-xl p-8 shadow-xl">
    <h2 className="text-2xl font-bold text-white text-center mb-8">Welcome back</h2>

    <form className="space-y-6" onSubmit={handleSubmit}>
      
      <div>
        <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-gray-400" aria-hidden="true" />
          <input 
            type="email" 
            id="email"
            name="email"
            autoComplete="email"
            required
            className="block w-full pl-9 pr-3 py-2.5 border border-transparent rounded-md bg-[#061927] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7fc4f5] text-sm" 
            placeholder="Enter your email"
          ></input>
        </div>
      </div>

      <div>
        <div className="mb-2">
          <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Password
          </label>
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-gray-400" aria-hidden="true" />
          <input 
            type="password" 
            id="password"
            name="password"
            autoComplete="current-password"
            required
            className="block w-full pl-9 pr-3 py-2.5 border border-transparent rounded-md bg-[#061927] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7fc4f5] text-sm" 
            placeholder="Enter your password"
          ></input>
        </div>
      </div>

      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex w-full items-center justify-center rounded-md bg-[#f8d46a] px-4 py-2.5 text-sm font-bold text-[#061927] shadow-sm transition-colors hover:bg-[#eabb4c] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <ArrowRight className="mr-2 size-4" />}
        {isSubmitting ? "Logging in..." : "Log In"}
      </button>
    </form>

    <div className="mt-8 text-center text-xs text-gray-400">
      Don&apos;t have an account? <Link href="/signup" className="text-white font-semibold hover:underline">Create Account</Link>
    </div>
  </div>
</div>
  )
}
