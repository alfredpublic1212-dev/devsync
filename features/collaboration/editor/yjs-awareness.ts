import { Awareness } from "y-protocols/awareness";
import { getSocket } from "@/features/collaboration/client/socket";

export function setupAwareness(
  awareness: Awareness,
  roomId: string,
  fileId: string
) {
  const socket = getSocket();
  let disposed = false;
  const onAwarenessUpdate = ({
    added,
    updated,
    removed,
  }: {
    added: number[];
    updated: number[];
    removed: number[];
  }) => {
    const changed = [...added, ...updated, ...removed];

    for (const clientId of changed) {
      const state = awareness.getStates().get(clientId) ?? null;

      socket.emit("awareness:update", {
        roomId,
        fileId,
        clientId,
        state,
      });
    }
  };

  const onSocketAwarenessUpdate = (payload: {
    fileId: string;
    clientId: number;
    state: Record<string, any> | null;
  }) => {
    if (payload.fileId !== fileId) return;

    const { clientId, state } = payload;

    if (state === null) {
      awareness.getStates().delete(clientId);
    } else {
      awareness.getStates().set(clientId, state);
    }
  };

  /* ---------- local → server ---------- */
  awareness.on("update", onAwarenessUpdate);

  /* ---------- server → local ---------- */
  socket.on("awareness:update", onSocketAwarenessUpdate);

  return () => {
    if (disposed) return;
    disposed = true;
    awareness.off("update", onAwarenessUpdate);
    socket.off("awareness:update", onSocketAwarenessUpdate);
  };
}
