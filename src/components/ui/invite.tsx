"use client";

import { Check, Copy, LoaderCircle, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function Invite() {
  const { data: session } = useSession();
  const [link, setLink] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "MANAGER") return null;

  async function generate() {
    setError("");
    setCopied(false);
    setIsCreating(true);
    const response = await fetch("/api/invites", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setIsCreating(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to create an invitation link.");
      return;
    }

    setLink(
      `${window.location.origin}/signup?code=${encodeURIComponent(data.code)}`,
    );
    setExpiresAt(new Date(data.expires_at).toLocaleDateString());
  }

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Invite your team</h2>
        <UserPlus className="size-5 text-primary" />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Share a signup link so a new account is created under you. Each link
        works for one signup only.
      </p>
      {link && (
        <div className="mt-4 rounded-2xl bg-muted p-4">
          <p className="break-all font-mono text-xs">{link}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              One use · expires {expiresAt}
            </span>
            <button
              onClick={copy}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:border-primary"
            >
              {copied ? (
                <Check className="size-3.5 text-primary" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        onClick={generate}
        disabled={isCreating}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-primary/50 bg-primary/10 px-4 py-3 text-sm font-semibold hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isCreating && <LoaderCircle className="size-4 animate-spin" />}
        {link ? "Generate a new link" : "Generate invitation link"}
      </button>
    </section>
  );
}
