import type {
  PresenceSnapshot,
  PresenceJoinPayload,
  PresenceLeavePayload,
} from "@/features/collaboration/presence/presence.types";

import type {
  TerminalSession,
  TerminalLog,
} from "@/features/terminal/terminal.store";

type EventMap = {
  /* -------- Room -------- */
  "room:joined": { roomId: string };
  "room:left": { roomId: string };

  /* -------- Filesystem -------- */
  "fs:snapshot": unknown;
  "fs:create": unknown;
  "fs:rename": unknown;
  "fs:delete": unknown;

  /* -------- Presence -------- */
  "presence:update": PresenceSnapshot;
  "presence:join": PresenceJoinPayload;
  "presence:leave": PresenceLeavePayload;

  /* -------- Terminal -------- */
  "terminal:session": TerminalSession;
  "terminal:log": TerminalLog;
};




type Handler<T> = (payload: T) => void;

class EventBus {
  private listeners = new Map<keyof EventMap, Set<Handler<any>>>();

  on<K extends keyof EventMap>(
    event: K,
    handler: Handler<EventMap[K]>
  ) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)!.delete(handler);
  }

  emit<K extends keyof EventMap>(
    event: K,
    payload: EventMap[K]
  ) {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
