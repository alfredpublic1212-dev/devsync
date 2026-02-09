import { eventBus } from "../client/event-bus";
import { useFSStore } from "./fs.store";
import type { FSSnapshot, FSNode } from "./fs.types";

/* ---------- Runtime validation ---------- */

function toUpdatedAt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

function toNode(p: unknown): FSNode | null {
  if (!p || typeof p !== "object") return null;
  const n = p as Partial<FSNode>;

  if (
    typeof n.id !== "string" ||
    typeof n.name !== "string" ||
    (n.type !== "file" && n.type !== "folder")
  ) {
    return null;
  }

  return {
    id: n.id,
    name: n.name,
    type: n.type,
    parentId:
      typeof n.parentId === "string" || n.parentId === null
        ? n.parentId
        : null,
    path: typeof n.path === "string" ? n.path : n.name,
    updatedAt: toUpdatedAt(n.updatedAt),
  };
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
  const candidate: Record<string, unknown> | null =
    p && typeof p === "object"
      ? (p as Record<string, unknown>)
      : null;

  return (
    !!candidate &&
    typeof candidate.id === "string"
  );
}

/* ---------- Registration ---------- */

export function registerFSHandlers(roomId: string) {
  const store = useFSStore.getState();

  const offSnapshot = eventBus.on(
    "fs:snapshot",
    (payload: unknown) => {
      if (!isSnapshot(payload)) return;
      if (payload.roomId !== roomId) return;

      const valid = payload.nodes
        .map((node) => toNode(node))
        .filter((node): node is FSNode => node !== null);
      store.setSnapshot(valid);
    }
  );

  // Backend room snapshot already includes the authoritative file tree.
  const offRoomSnapshot = eventBus.on(
    "room:snapshot",
    (payload) => {
      if (payload.roomId !== roomId) return;
      const valid = payload.tree
        .map((node) => toNode(node))
        .filter((node): node is FSNode => node !== null);
      store.setSnapshot(valid);
    }
  );

  const offCreate = eventBus.on(
    "fs:create",
    (payload) => {
      const node = toNode(payload);
      if (!node) return;
      store.upsertNode(node);
    }
  );

  const offRename = eventBus.on(
    "fs:rename",
    (payload) => {
      const node = toNode(payload);
      if (!node) return;
      store.upsertNode(node);
    }
  );

  const offDelete = eventBus.on(
    "fs:delete",
    (payload) => {
      if (!isDeletePayload(payload)) return;
      store.removeNode(payload.id);
    }
  );

  const offLeave = eventBus.on("room:left", () => {
    store.clear();
  });

  return () => {
    offSnapshot();
    offRoomSnapshot();
    offCreate();
    offRename();
    offDelete();
    offLeave();
  };
}
