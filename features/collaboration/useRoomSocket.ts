"use client";

import { useEffect } from "react";
import { getSocket } from "./socket.client";

export function useRoomSocket(roomId: string, user: any) {
  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) socket.connect();

    socket.emit("room:join", { roomId, user });

    return () => {
      socket.emit("room:leave", { roomId });
    };
  }, [roomId]);
}
