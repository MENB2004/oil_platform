// src/lib/requireAuth.tsx
"use client";
import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRequireAuth(redirectTo = "/signin") {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo]);

  return { user };
}
