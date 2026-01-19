// src/components/ThemeProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // server-safe default
  const [theme, setThemeState] = useState<Theme>("light");
  // indicates hydration completed and client values are known
  const [mounted, setMounted] = useState(false);

  // On mount read localStorage / prefers-color-scheme and set theme
  useEffect(() => {
    try {
      const stored = localStorage.getItem("oc_theme");
      if (stored === "dark" || stored === "light") {
        setThemeState(stored as Theme);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark");
      } else {
        setThemeState("light");
      }
    } catch {
      setThemeState("light");
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    // persist and toggle root class whenever theme changes on client
    if (!mounted) return;
    try {
      localStorage.setItem("oc_theme", theme);
    } catch { }
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme, mounted]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((s) => (s === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
