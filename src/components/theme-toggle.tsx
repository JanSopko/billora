"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors">
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunIcon className="w-5 h-5 text-foreground" />
      ) : (
        <MoonIcon className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
}
