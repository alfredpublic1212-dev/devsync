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

  /* ---- Full snapshot ---- */
  const offSnapshot = eventBus.on(
    "presence:update",
    (payload) => {
      if (!isSnapshot(payload)) return;
      if (payload.roomId !== roomId) return;

      const validUsers = payload.users.filter(isPresenceUser);
      store.setSnapshot(validUsers);
    }
  );

  /* ---- User joined ---- */
  const offJoin = eventBus.on(
    "presence:join",
    (payload) => {
      if (!isPresenceUser(payload)) return;
      store.upsertUser(payload);
    }
  );

  /* ---- User left ---- */
  const offLeave = eventBus.on(
    "presence:leave",
    (payload) => {
      if (!payload || typeof payload.userId !== "string") return;
      store.markOffline(payload.userId);
    }
  );

  /* ---- Room lifecycle ---- */
  const offRoomLeave = eventBus.on(
    "room:left",
    () => {
      store.clear();
    }
  );

  return () => {
    offSnapshot();
    offJoin();
    offLeave();
    offRoomLeave();
  };
}
