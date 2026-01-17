/* ===============================
   FILE: features/collaboration/filesystem/fs.handlers.ts
=============================== */

import { eventBus } from "../client/event-bus";
import { useFSStore } from "./fs.store";
import type { FSSnapshot, FSNode } from "./fs.types";

/* ---------- Runtime validation ---------- */

function isNode(n: any): n is FSNode {
  return (
    n &&
    typeof n.id === "string" &&
    typeof n.name === "string" &&
    typeof n.type === "string" &&
    typeof n.path === "string"
  );
}

function isSnapshot(p: any): p is FSSnapshot {
  return (
    p &&
    typeof p.roomId === "string" &&
    Array.isArray(p.nodes)
  );
}

/* ---------- Registration ---------- */

export function registerFSHandlers(roomId: string) {
  const store = useFSStore.getState();

  const offSnapshot = eventBus.on(
    "fs:snapshot",
    (payload) => {
      if (!isSnapshot(payload)) return;
      if (payload.roomId !== roomId) return;

      const valid = payload.nodes.filter(isNode);
      store.setSnapshot(valid);
    }
  );

  const offCreate = eventBus.on(
    "fs:create",
    (node) => {
      if (!isNode(node)) return;
      store.upsertNode(node);
    }
  );

  const offRename = eventBus.on(
    "fs:rename",
    (node) => {
      if (!isNode(node)) return;
      store.upsertNode(node);
    }
  );

  const offDelete = eventBus.on(
    "fs:delete",
    ({ id }) => {
      if (typeof id !== "string") return;
      store.removeNode(id);
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
