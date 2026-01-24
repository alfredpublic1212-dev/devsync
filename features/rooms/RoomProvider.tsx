"use client";

import { useEffect } from "react";
import type { Room } from "./room.types";
import { useRoomStore } from "./room.client.store";

interface RoomProviderProps {
  room: Room;
  children: React.ReactNode;
}

export default function RoomProvider({
  room,
  children,
}: RoomProviderProps) {
  const setRoom = useRoomStore((s) => s.setRoom);
  const reset = useRoomStore((s) => s.reset);

  useEffect(() => {
    setRoom(room);

    return () => {
      reset();
    };
  }, [room, setRoom, reset]);

  return <>{children}</>;
}
