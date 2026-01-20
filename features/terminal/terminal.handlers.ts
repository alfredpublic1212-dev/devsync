import { eventBus } from "@/features/collaboration/client/event-bus";
import { useTerminalStore } from "./terminal.store";
import type { TerminalLog, TerminalSession } from "./terminal.store";

/* ---------- Runtime validation ---------- */
function isSession(p: unknown): p is TerminalSession {
  if (!p || typeof p !== "object") return false;

  const s = p as TerminalSession;

  return (
    typeof s.id === "string" &&
    typeof s.roomId === "string" &&
    typeof s.status === "string"
  );
}


function isLog(p: any): p is TerminalLog {
  return (
    p &&
    typeof p.id === "string" &&
    typeof p.timestamp === "number" &&
    typeof p.message === "string" &&
    typeof p.type === "string"
  );
}

/* ---------- Registration ---------- */

export function registerTerminalHandlers(roomId: string) {
  const store = useTerminalStore.getState();

  const offSession = eventBus.on(
    "terminal:session",
    (payload) => {
      if (!isSession(payload)) return;
      if (payload.roomId !== roomId) return;

      store.setSession(payload);
    }
  );

  const offLog = eventBus.on(
    "terminal:log",
    (payload) => {
      if (!isLog(payload)) return;
      store.appendLog(payload);
    }
  );

  const offLeave = eventBus.on(
    "room:left",
    () => {
      store.clear();
    }
  );

  return () => {
    offSession();
    offLog();
    offLeave();
  };
}
