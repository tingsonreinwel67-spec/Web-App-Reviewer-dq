"use client";
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
    <header className="app-gutter relative z-20 flex items-center justify-between gap-3 py-3 sm:py-4">
      <button onClick={home} className="-ml-1 flex min-h-11 items-center gap-2 px-1 font-mono text-sm font-bold">
        REVIEWER
      </button>
      <Profile progress={progress} theme={theme} toggleTheme={toggleTheme} />
    </header>
  );
}