// features/rooms/room.hooks.ts
"use client";

import { useEffect } from "react";
import { eventBus } from "@/features/collaboration/client/event-bus";
import { useRoomStore } from "./room.store";

export function useRoomSnapshot(roomId: string) {
  const {
    setRoom,
    setMembers,
    setError,
    setAwaitingRoleAssignment,
    upsertJoinRequest,
    pruneJoinRequestsByMembers,
    markReady,
    reset,
  } = useRoomStore();

  useEffect(() => {
    const offSnapshot = eventBus.on("room:snapshot", (payload) => {
      if (payload.roomId !== roomId) return;

      setRoom(payload.room);
      setMembers(payload.members);
      pruneJoinRequestsByMembers(payload.members);
      setError(null);
      setAwaitingRoleAssignment(false, null);
      markReady();
    });

    const offError = eventBus.on("room:error", (payload) => {
      if (payload.roomId && payload.roomId !== roomId) return;

      const normalizedCode = payload.code?.toLowerCase() ?? "";
      const normalizedMessage = payload.message.toLowerCase();
      const isPendingApproval =
        normalizedCode.includes("pending") ||
        normalizedCode.includes("approval") ||
        normalizedCode.includes("assign_role") ||
        normalizedMessage.includes("assign") ||
        normalizedMessage.includes("pending");

      if (isPendingApproval) {
        setAwaitingRoleAssignment(true, payload.message);
        setError(null);
        return;
      }

      setAwaitingRoleAssignment(false, null);
      setError(payload.message);
    });

    const offJoinRequest = eventBus.on("room:join-request", (payload) => {
      if (payload.roomId !== roomId) return;
      upsertJoinRequest(payload);
    });

    const offLeave = eventBus.on(
      "room:left",
      (payload) => {
        if (payload.roomId !== roomId) return;
        reset();
      }
    );

    return () => {
      offSnapshot();
      offError();
      offJoinRequest();
      offLeave();
    };
  }, [
    roomId,
    setRoom,
    setMembers,
    setError,
    setAwaitingRoleAssignment,
    upsertJoinRequest,
    pruneJoinRequestsByMembers,
    markReady,
    reset,
  ]);
}
