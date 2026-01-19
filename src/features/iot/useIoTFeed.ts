// src/features/iot/useIoTFeed.ts
import { useEffect, useState } from "react";

export type IoTEvent = {
  householdId: string;
  oilMl: number;
  timestamp: string;
};

export function useIoTFeed(wsUrl?: string) {
  const [events, setEvents] = useState<IoTEvent[]>([]);

  useEffect(() => {
    if (!wsUrl) return;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as IoTEvent;
        setEvents((p) => [...p, parsed]);
      } catch (e) {
        // ignore
      }
    };
    return () => ws.close();
  }, [wsUrl]);

  return { events };
}
