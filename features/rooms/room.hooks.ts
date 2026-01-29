"use client";

import { useEffect } from "react";
import { eventBus } from "@/features/collaboration/client/event-bus";
import { useRoomStore } from "./room.store";
import { hasRoomSnapshot } from "@/features/collaboration/client/connection";

export function useRoomSnapshot(roomId: string) {
  const { markReady } = useRoomStore();

  useEffect(() => {
    // ✅ HANDLE MISSED SNAPSHOT
    if (hasRoomSnapshot()) {
      markReady();
    }

    const off = eventBus.on("room:snapshot", (payload) => {
      if (payload.roomId !== roomId) return;
      markReady();
    });

    return off;
  }, [roomId, markReady]);
}
