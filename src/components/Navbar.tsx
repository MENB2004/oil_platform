// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { theme, toggle, mounted } = useTheme();
  const { user, signout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signout();
    router.push("/");
  };

  const shortEmail = (email?: string | null) =>
    !email ? "" : email.length > 18 ? email.slice(0, 12) + "..." + email.slice(-4) : email;

  const initialsFromEmail = (email?: string | null) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(/[\._\-]/).filter(Boolean);
    if (parts.length === 0) return email.slice(0, 1).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
  };

  return (
    <nav className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-[130rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* left: logo + app name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/oil-drop.svg"
                alt="logo"
                width={36}
                height={36}
                className="dark:invert"
              />
              <span className="font-semibold text-lg">Oil Platform</span>
            </Link>
          </div>

          {/* right: nav links + controls */}
          <div className="flex items-center gap-4">
            {/* primary nav (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard" className="text-sm hover:text-amber-600">
                Dashboard
              </Link>
              <Link href="/audit" className="text-sm hover:text-amber-600">
                Audit
              </Link>
              <Link href="/policymaker" className="text-sm hover:text-amber-600">
                Policymaker
              </Link>
            </div>

            {/* controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle()}
                className="rounded-full bg-zinc-200 dark:bg-zinc-700 px-3 py-1 text-sm font-medium"
                aria-label="Toggle theme"
              >
                {mounted ? (theme === "dark" ? "Light" : "Dark") : "Light"}
              </button>

              <Button variant="secondary" onClick={() => router.push("/#features")}>
                Home
              </Button>

              {/* Auth area */}
              {user ? (
                <div className="flex items-center gap-3 ml-2">
                  {/* avatar + email (collapsible on very small screens) */}
                  <button
                    onClick={() => router.push("/profile")}
                    aria-label="Open profile"
                    className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 text-white font-medium text-sm select-none">
                      {initialsFromEmail(user.email)}
                    </div>
                    <span className="hidden sm:inline text-sm text-zinc-700 dark:text-zinc-300">
                      {shortEmail(user.email)}
                    </span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-sm"
                    aria-label="Sign out"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  className="px-3 py-1 rounded bg-amber-500 text-white text-sm font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
