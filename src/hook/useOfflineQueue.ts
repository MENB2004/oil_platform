// src/hooks/useOfflineQueue.ts
import { useEffect, useRef } from "react";
import { useOfflineStore } from "@/features/offline/store";
import { postSafe } from "@/lib/api";
import { toast } from "react-hot-toast";

export function useOfflineQueue() {
  const queue = useOfflineStore((s) => s.queue);
  const removeJob = useOfflineStore((s) => s.removeJob);
  const processing = useRef(false);
  const attempts = useRef<Record<string, number>>({});

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const isClientError = (status?: number) => !!status && status >= 400 && status < 500;

  const processQueue = async () => {
    if (processing.current) return;
    processing.current = true;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.debug("Offline: skipping queue processing");
      processing.current = false;
      return;
    }

    for (const job of queue) {
      try {
        const count = (attempts.current[job.id] || 0) + 1;
        attempts.current[job.id] = count;

        const res = await postSafe(job.path, job.payload);

        if (res.ok && res.status && res.status >= 200 && res.status < 300) {
          await removeJob(job.id);
          toast.success("Queued item synced");
          // reset attempts
          delete attempts.current[job.id];
        } else {
          if (res.isNetworkError) {
            console.warn("Network error, will retry later:", job.id, res.message);
            // exponential backoff
            const backoff = Math.min(1000 * Math.pow(2, count), 30_000);
            await sleep(backoff);
            continue;
          } else if (isClientError(res.status)) {
            console.warn("Dropping queued job (client error):", job.id, res.status, res.data);
            await removeJob(job.id);
            toast.error("Dropped invalid queued item");
            continue;
          } else {
            console.warn("Server error; will retry later:", job.id, res.status);
            const backoff = Math.min(1000 * Math.pow(2, count), 30_000);
            await sleep(backoff);
            continue;
          }
        }
      } catch (e) {
        console.error("Unexpected error processing queue:", e);
        break;
      }
    }

    processing.current = false;
  };

  useEffect(() => {
    if (queue.length === 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine) void processQueue();
  }, [queue]);

  return { processQueue };
}
