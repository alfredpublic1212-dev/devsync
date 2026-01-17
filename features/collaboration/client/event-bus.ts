/* ===============================
   FILE: features/collaboration/client/event-bus.ts
=============================== */

type EventMap = {
  "room:joined": { roomId: string };
  "room:left": { roomId: string };

  "fs:snapshot": unknown;
  "fs:create": unknown;
  "fs:rename": unknown;
  "fs:delete": unknown;

  "file:update": unknown;
  "cursor:update": unknown;

  "presence:update": unknown;
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

    return () => {
      this.listeners.get(event)!.delete(handler);
    };
  }

  emit<K extends keyof EventMap>(
    event: K,
    payload: EventMap[K]
  ) {
    this.listeners.get(event)?.forEach((handler) => {
      handler(payload);
    });
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
