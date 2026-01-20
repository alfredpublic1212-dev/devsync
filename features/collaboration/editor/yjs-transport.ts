// features/collaboration/editor/yjs-transport.ts

import * as Y from "yjs";
import { getSocket } from "@/features/collaboration/client/socket";

export function bindYjsToSocket(
  doc: Y.Doc,
  roomId: string,
  fileId: string
) {
  const socket = getSocket();
  let isSynced = false;

  /* ---------- Local → Server ---------- */
  const onLocalUpdate = (update: Uint8Array, origin: any) => {
    // Don't send updates that came from the server
    if (origin === "server") return;
    if (!isSynced) return; // Wait for initial sync

    socket.emit("yjs:update", {
      roomId,
      fileId,
      update: Array.from(update), // Convert to array for JSON serialization
    });
  };

  doc.on("update", onLocalUpdate);

  /* ---------- Server → Local ---------- */
  const onRemoteUpdate = (payload: {
    fileId: string;
    update: number[] | Uint8Array;
  }) => {
    if (payload.fileId !== fileId) return;

    try {
      const update = 
        payload.update instanceof Uint8Array 
          ? payload.update 
          : new Uint8Array(payload.update);

      Y.applyUpdate(doc, update, "server");
    } catch (err) {
      console.error("Error applying remote Yjs update:", err);
    }
  };

  socket.on("yjs:update", onRemoteUpdate);

  /* ---------- Initial sync ---------- */
  const onInitialSync = (payload: { 
    fileId: string; 
    update: number[] | Uint8Array;
  }) => {
    if (payload.fileId !== fileId) return;

    try {
      const update = 
        payload.update instanceof Uint8Array 
          ? payload.update 
          : new Uint8Array(payload.update);

      Y.applyUpdate(doc, update, "server");
      isSynced = true;
    } catch (err) {
      console.error("Error applying initial Yjs sync:", err);
      isSynced = true; // Still mark as synced to allow local edits
    }
  };

  socket.once("yjs:sync", onInitialSync);

  // Request initial state
  socket.emit("yjs:join", { roomId, fileId });

  // Fallback: mark as synced after timeout
  const syncTimeout = setTimeout(() => {
    isSynced = true;
  }, 2000);

  /* ---------- Cleanup ---------- */
  return () => {
    clearTimeout(syncTimeout);
    doc.off("update", onLocalUpdate);
    socket.off("yjs:update", onRemoteUpdate);
    socket.off("yjs:sync", onInitialSync);
  };
}