"use client";

import { BookOpen } from "lucide-react";
import { Profile } from "./profile";

export function Header({
  home,
  progress,
  theme,
  toggleTheme,
}: {
  home: () => void;
  progress: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4">
      <button onClick={home} className="flex items-center gap-2 font-mono text-sm font-bold">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="size-4" />
        </span>
        REVIEWER
      </button>
      <Profile progress={progress} theme={theme} toggleTheme={toggleTheme} />
    </header>
  );
}