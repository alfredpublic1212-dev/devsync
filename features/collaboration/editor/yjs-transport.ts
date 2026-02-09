// features/collaboration/editor/yjs-transport.ts

import * as Y from "yjs";
import { getSocket } from "@/features/collaboration/client/socket";
import { toYjsUpdatePayload } from "@/features/collaboration/client/socket.contract";

export function bindYjsToSocket(
  doc: Y.Doc,
  roomId: string,
  fileId: string
) {
  const socket = getSocket();
  let isSynced = false;
  let destroyed = false;
  let disposed = false;
  
  const emitJoin = () => {
    if (destroyed) return;
    isSynced = false;
    socket.emit("yjs:join", { roomId, fileId });
  };

  /* ---------- Local → Server ---------- */
  const onLocalUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === "server") return;
    if (!isSynced) return;

    socket.emit("yjs:update", {
      roomId,
      fileId,
      update: Array.from(update),
    });
  };

  doc.on("update", onLocalUpdate);

  /* ---------- Server → Local ---------- */
  const onRemoteUpdate = (payload: unknown) => {
    if (destroyed) return;
    const normalized = toYjsUpdatePayload(payload);
    if (!normalized) return;
    if (normalized.roomId !== roomId || normalized.fileId !== fileId) return;

    const update =
      normalized.update instanceof Uint8Array
        ? normalized.update
        : new Uint8Array(normalized.update);

    Y.applyUpdate(doc, update, "server");
  };

  socket.on("yjs:update", onRemoteUpdate);

  /* ---------- Initial Sync ---------- */
  const onSync = (payload: unknown) => {
    if (destroyed) return;
    const normalized = toYjsUpdatePayload(payload);
    if (!normalized) return;
    if (normalized.roomId !== roomId || normalized.fileId !== fileId) return;

    const update =
      normalized.update instanceof Uint8Array
        ? normalized.update
        : new Uint8Array(normalized.update);

    Y.applyUpdate(doc, update, "server");
    isSynced = true;
  };

  socket.on("yjs:sync", onSync);
  socket.on("connect", emitJoin);

  /* ---------- Join document ---------- */
  emitJoin();

  /* ---------- Failsafe ---------- */
  const syncTimeout = setTimeout(() => {
    isSynced = true;
  }, 1500);

  /* ---------- Cleanup ---------- */
  return () => {
    if (disposed) return;
    disposed = true;
    destroyed = true;
    clearTimeout(syncTimeout);

    doc.off("update", onLocalUpdate);
    socket.off("yjs:update", onRemoteUpdate);
    socket.off("yjs:sync", onSync);
    socket.off("connect", emitJoin);
  };
}
