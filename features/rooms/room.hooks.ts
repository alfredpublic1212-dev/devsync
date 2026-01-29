import { useEffect } from "react";
import { eventBus } from "@/features/collaboration/client/event-bus";
import { useRoomStore } from "./room.store";

export function useRoomSnapshot(roomId: string) {
  const { markReady } = useRoomStore();

  useEffect(() => {
    const off = eventBus.on("room:snapshot", (payload) => {
      if (payload.roomId !== roomId) return;
      markReady();
    });

    return off;
  }, [roomId]);
}
