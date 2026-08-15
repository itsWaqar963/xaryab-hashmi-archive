"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

const LiveOnlineContext = createContext(1);

function getSessionId(): string {
  const key = "xaryab-presence-id";
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

export function LiveOnlineProvider({ children }: { children: ReactNode }) {
  const sessionId = useMemo(() => getSessionId(), []);
  const [online, setOnline] = useState(1);

  useEffect(() => {
    const channel = supabase.channel("archive-online", {
      config: {
        presence: { key: sessionId },
      },
    });

    const sync = () => {
      const state = channel.presenceState();
      setOnline(Math.max(Object.keys(state).length, 1));
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return (
    <LiveOnlineContext.Provider value={online}>
      {children}
    </LiveOnlineContext.Provider>
  );
}

function useLiveOnlineCount(): number {
  return useContext(LiveOnlineContext);
}

/** Same slot as former archive label: glowing green dot + "{n} online". */
export default function LiveOnlineBadge() {
  const online = useLiveOnlineCount();

  return (
    <div
      className="live-online-badge"
      aria-live="polite"
      title="People viewing the archive right now"
    >
      <span className="live-online-dot" aria-hidden="true">
        <span className="live-online-dot-ping" />
        <span className="live-online-dot-core" />
      </span>
      <span className="live-online-text">{online} online</span>
    </div>
  );
}
