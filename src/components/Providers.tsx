// src/components/Providers.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useOfflineStore } from "@/features/offline/store";
import { useOfflineQueue } from "@/hook/useOfflineQueue";
import { Toaster, toast } from "react-hot-toast";
import { ThemeProvider } from "./ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const loadQueue = useCallback(() => {
    void useOfflineStore.getState().loadQueue();
  }, []);

  const { processQueue } = useOfflineQueue();
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const queued = useOfflineStore((s) => s.queue.length);

  useEffect(() => {
    loadQueue();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    if (navigator.onLine) {
      void processQueue();
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [loadQueue, processQueue]);

  const handleSyncNow = async () => {
    if (!navigator.onLine) {
      toast.error("You are offline — connect to the internet to sync.");
      return;
    }
    const id = toast.loading("Syncing queued items…");
    try {
      await processQueue();
      toast.success("Sync completed", { id });
    } catch (err) {
      toast.error("Sync failed — will retry when online", { id });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster position="bottom-right" />
        <div className="fixed right-4 bottom-4 z-[9999]">
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-2xl shadow-lg">
            <div className={`w-3 h-3 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`} />
            <div className="text-sm text-zinc-700 dark:text-zinc-200">
              {online ? "Online" : "Offline"}
              {queued > 0 && <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">• {queued} queued</span>}
            </div>
            <button
              onClick={handleSyncNow}
              className="ml-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
            >
              Sync now
            </button>
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
