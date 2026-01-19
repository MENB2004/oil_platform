//src/app/signin/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

export default function SignInPage() {
  const { signin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = await signin(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || "Login failed");
      return;
    }
    // go to dashboard after login
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Sign in to Oil Consumption Platform</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded bg-amber-500 text-white font-medium disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <a href="#" onClick={(e) => e.preventDefault()} className="text-sm hover:underline">
              Forgot password?
            </a>
          </div>
        </form>

        <p className="text-sm mt-4 text-zinc-600 dark:text-zinc-400">
          No account? <a href="#" className="text-amber-600 hover:underline">Contact admin</a>
        </p>
      </div>
    </div>
  );
}
