"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  signin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // load from localStorage
    try {
      const raw = localStorage.getItem("oc_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // persist
    try {
      if (token && user) {
        localStorage.setItem("oc_auth", JSON.stringify({ user, token }));
      } else {
        localStorage.removeItem("oc_auth");
      }
    } catch { }
  }, [user, token]);

  const signin = async (email: string, password: string) => {
    // call our mock API route
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data?.message || "Login failed" };
      setToken(data.token);
      setUser({ email: data.email });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: (err as Error).message || "Network error" };
    }
  };

  const signout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("oc_auth");
    } catch { }
  };

  return (
    <AuthContext.Provider value={{ user, token, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};
