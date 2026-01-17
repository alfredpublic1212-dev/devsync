/* ===============================
   FILE: features/collaboration/presence/presence.handlers.ts
=============================== */

import { eventBus } from "../client/event-bus";
import { usePresenceStore } from "./presence.store";
import type {
  PresenceSnapshot,
  PresenceUser,
} from "./presence.types";

/* ---------- Runtime validation ---------- */

function isPresenceUser(u: any): u is PresenceUser {
  return (
    u &&
    typeof u.userId === "string" &&
    typeof u.name === "string" &&
    typeof u.color === "string"
  );
}

function isSnapshot(p: any): p is PresenceSnapshot {
  return (
    p &&
    typeof p.roomId === "string" &&
    Array.isArray(p.users)
  );
}

/* ---------- Registration ---------- */

export function registerPresenceHandlers(roomId: string) {
  const store = usePresenceStore.getState();

  const offSnapshot = eventBus.on(
    "presence:update",
    (payload) => {
      if (!isSnapshot(payload)) return;
      if (payload.roomId !== roomId) return;

      const validUsers = payload.users.filter(isPresenceUser);
      store.setSnapshot(validUsers);
    }
  );

  const offJoin = eventBus.on(
    "room:joined",
    () => {
      // server will push fresh snapshot
    }
  );

  const offLeave = eventBus.on(
    "room:left",
    () => {
      store.clear();
    }
  );

  return () => {
    offSnapshot();
    offJoin();
    offLeave();
  };
}
