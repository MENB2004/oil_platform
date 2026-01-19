// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from "react";

export function useWebSocket(url?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!url) return;
    let mounted = true;
    let retry = 0;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mounted) return;
        setConnected(true);
        retry = 0;
      };
      ws.onmessage = (e) => {
        try {
          setMessages((m) => [...m, JSON.parse(e.data)]);
        } catch {
          setMessages((m) => [...m, e.data]);
        }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!mounted) return;
        retry++;
        setTimeout(connect, Math.min(5000 * retry, 30000));
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      mounted = false;
      wsRef.current?.close();
    };
  }, [url]);

  const send = (payload: any) => {
    try {
      wsRef.current?.send(JSON.stringify(payload));
    } catch {}
  };

  return { messages, connected, send };
}
