import { eventBus } from "../client/event-bus";
import { useFSStore } from "./fs.store";
import type { FSSnapshot, FSNode } from "./fs.types";

/* ---------- Runtime validation ---------- */

function isNode(p: unknown): p is FSNode {
  if (!p || typeof p !== "object") return false;

  const n = p as FSNode;

  return (
    typeof n.id === "string" &&
    typeof n.name === "string" &&
    typeof n.type === "string" &&
    typeof n.path === "string"
  );
}

function isSnapshot(p: unknown): p is FSSnapshot {
  if (!p || typeof p !== "object") return false;

  const s = p as FSSnapshot;

  return (
    typeof s.roomId === "string" &&
    Array.isArray(s.nodes)
  );
}

function isDeletePayload(p: unknown): p is { id: string } {
  if (!p || typeof p !== "object") return false;
  return typeof (p as { id?: unknown }).id === "string";
}

/* ---------- Registration ---------- */

export function registerFSHandlers(roomId: string) {
  const store = useFSStore.getState();

  const offSnapshot = eventBus.on(
    "fs:snapshot",
    (payload: unknown) => {
      if (!isSnapshot(payload)) return;
      if (payload.roomId !== roomId) return;

      const validNodes = payload.nodes.filter(isNode);
      store.setSnapshot(validNodes);
    }
  );

  const offCreate = eventBus.on(
    "fs:create",
    (payload: unknown) => {
      if (!isNode(payload)) return;
      store.upsertNode(payload);
    }
  );

  const offRename = eventBus.on(
    "fs:rename",
    (payload: unknown) => {
      if (!isNode(payload)) return;
      store.upsertNode(payload);
    }
  );

  const offDelete = eventBus.on(
    "fs:delete",
    (payload: unknown) => {
      if (!isDeletePayload(payload)) return;
      store.removeNode(payload.id);
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
    offCreate();
    offRename();
    offDelete();
    offLeave();
  };
}
