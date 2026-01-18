import * as Y from "yjs";
import { getSocket } from "@/features/collaboration/client/socket";

/**
 * Wires a Y.Doc to Socket.IO
 * This replaces yjs-provider
 */
export function bindYjsToSocket(
  doc: Y.Doc,
  roomId: string,
  fileId: string
) {
  const socket = getSocket();

  /* ---------- Local → Server ---------- */
  const onLocalUpdate = (update: Uint8Array) => {
    socket.emit("yjs:update", {
      roomId,
      fileId,
      update,
    });
  };

  doc.on("update", onLocalUpdate);

  /* ---------- Server → Local ---------- */
  const onRemoteUpdate = (payload: {
    fileId: string;
    update: Uint8Array;
  }) => {
    if (payload.fileId !== fileId) return;

    Y.applyUpdate(doc, payload.update);
  };

  socket.on("yjs:update", onRemoteUpdate);

  /* ---------- Initial sync ---------- */
  socket.emit("yjs:join", { roomId, fileId });

  socket.on("yjs:sync", ({ fileId: fid, update }) => {
    if (fid !== fileId) return;
    Y.applyUpdate(doc, update);
  });

  /* ---------- Cleanup ---------- */
  return () => {
    doc.off("update", onLocalUpdate);
    socket.off("yjs:update", onRemoteUpdate);
  };
}
