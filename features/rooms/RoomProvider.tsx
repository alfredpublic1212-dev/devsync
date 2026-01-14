"use client";

import { useEffect } from "react";
import { useRoomStore } from "./room.store";
import type { Room } from "./room.types";

export default function RoomProvider({
  room,
  children,
}: {
  room: Room;
  children: React.ReactNode;
}) {
  const setRoom = useRoomStore((s) => s.setRoom);

  useEffect(() => {
    setRoom(room);
  }, [room, setRoom]);

  return <>{children}</>;
}
