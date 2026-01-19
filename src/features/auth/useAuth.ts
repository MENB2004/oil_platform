// src/features/auth/useAuth.ts
import { useState, useEffect } from "react";

export type User = { id: string; name?: string; email?: string; role?: string };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // quick local stub: load from localStorage
    const raw = typeof window !== "undefined" ? localStorage.getItem("oc_user") : null;
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  const signin = async (payload: { email: string; name?: string }) => {
    const u: User = { id: `u-${Date.now()}`, name: payload.name || payload.email, email: payload.email, role: "user" };
    setUser(u);
    localStorage.setItem("oc_user", JSON.stringify(u));
    return u;
  };

  const signout = async () => {
    setUser(null);
    localStorage.removeItem("oc_user");
  };

  return { user, loading, signin, signout, setUser };
}
