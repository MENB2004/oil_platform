// src/lib/api.ts
// Frontend-first API shim:
// - If NEXT_PUBLIC_API_URL is set, use axios against that base.
// - If not set, use an in-memory mock that simulates responses (no backend required).

import axios, { AxiosError } from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

const REAL_MODE = !!BASE;

let api = null as any;

if (REAL_MODE) {
  api = axios.create({
    baseURL: BASE,
    headers: { "Content-Type": "application/json" },
    timeout: 10_000,
  });

  api.interceptors.response.use(
    (res: any) => res,
    (err: AxiosError) => {
      const isNetwork = !err.response;
      if (isNetwork) {
        console.error("API error: Network Error", err.message);
        (err as any).isNetworkError = true;
      } else {
        console.error("API error:", err.response?.status, err.response?.data || err.message);
      }
      return Promise.reject(err);
    }
  );
} else {
  // Mock adapter:
  // Very small, deterministic mock implementation: only POST is required for offline queue.
  api = {
    async post(path: string, payload: any) {
      // Simulate a small network delay
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
      // Simulate behavior for specific paths if you want:
      // if (path.includes("/audits")) { ... }
      // Default: return a successful mock response object resembling axios response
      return {
        status: 201,
        data: {
          ok: true,
          mock: true,
          path,
          payload,
          id: `mock-${Date.now()}`,
        },
      };
    },

    // If other methods are accidentally used, provide safe no-op fallbacks
    async get(_path: string) {
      await new Promise((r) => setTimeout(r, 200));
      return { status: 200, data: {} };
    },
  };
  // No interceptors for mock
}

/**
 * Safe post helper that never throws — returns normalized result.
 */
export async function postSafe(path: string, payload: any) {
  if (REAL_MODE) {
    try {
      const res = await api.post(path, payload);
      return { ok: true, status: res.status, data: res.data };
    } catch (err) {
      const e = err as AxiosError;
      return {
        ok: false,
        status: e.response?.status,
        isNetworkError: (e as any).isNetworkError === true || e.code === "ECONNABORTED",
        message: e.message,
        data: e.response?.data,
      };
    }
  } else {
    // Mock mode: always succeed (you can add logic to simulate failures)
    try {
      const res = await api.post(path, payload);
      return { ok: true, status: res.status || 200, data: res.data };
    } catch (err) {
      // extremely unlikely in mock, but keep the shape
      const e = err as any;
      return {
        ok: false,
        status: e?.status,
        isNetworkError: false,
        message: e?.message || "Mock error",
        data: e?.data,
      };
    }
  }
}

// Export underlying axios instance (real or mock) if other code imports it
export { api };
