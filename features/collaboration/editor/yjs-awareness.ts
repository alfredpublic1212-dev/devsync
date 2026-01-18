import { Awareness } from "y-protocols/awareness";
import { getSocket } from "@/features/collaboration/client/socket";

export function setupAwareness(
  awareness: Awareness,
  roomId: string,
  fileId: string
) {
  const socket = getSocket();

  /* ---------- local → server ---------- */
  awareness.on(
    "update",
    ({
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
    }
  );

  /* ---------- server → local ---------- */
  socket.on("awareness:update", (payload) => {
    if (payload.fileId !== fileId) return;

    const { clientId, state } = payload;

    if (state === null) {
      awareness.getStates().delete(clientId);
    } else {
      awareness.getStates().set(clientId, state);
    }
  });
}
