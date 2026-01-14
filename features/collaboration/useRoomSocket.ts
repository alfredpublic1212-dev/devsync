"use client";

import { useEffect } from "react";
import { getSocket } from "./socket.client";

let joinedRoom: string | null = null;

export function useRoomSocket(roomId: string, userId: string) {
  useEffect(() => {
    const socket = getSocket();

    if (joinedRoom === roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("room:join", { roomId, userId });
    joinedRoom = roomId;

    return () => {
      if (joinedRoom === roomId) {
        socket.emit("room:leave", { roomId });
        joinedRoom = null;
      }

      socket.disconnect();
    };
  }, [roomId, userId]);
}
