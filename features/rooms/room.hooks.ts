import { useEffect } from "react";
import { eventBus } from "@/features/collaboration/client/event-bus";
import { useRoomStore } from "./room.store";
import type { RoomSnapshot } from "./room.types";

export function useRoomSnapshot(roomId: string) {
  const { markReady } = useRoomStore();

  useEffect(() => {
    const off = eventBus.on(
      "room:snapshot",
      (payload: RoomSnapshot) => {
        if (payload.roomId !== roomId) return;

        // ✅ Snapshot = authoritative signal that room is ready
        markReady();
      }
    );

    return off;
  }, [roomId, markReady]);
}
