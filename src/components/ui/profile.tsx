"use client";

import {
  BarChart3,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";

export function Profile({
  progress,
  theme,
  toggleTheme,
}: {
  progress: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 hover:bg-muted"
        aria-expanded={profileOpen}
        aria-label="Open user menu"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="size-4" />
        </span>
        <span className="hidden text-left text-xs font-semibold sm:block">Reinwel_Tingson</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {profileOpen && (
        <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-xl">
          <div className="border-b border-border px-3 py-3">
            <p className="font-semibold">Reinwel_Tingson</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">tingsonreinwel67@gmail.com</p>
          </div>
          <button onClick={() => { setProfileOpen(false); progress(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted">
            <BarChart3 className="size-4 text-primary" /> Progress
          </button>
          <button onClick={() => { toggleTheme(); setProfileOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted">
            {theme === "dark" ? <Sun className="size-4 text-primary" /> : <Moon className="size-4 text-primary" />} {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-3 border-t border-border px-3 py-3 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}