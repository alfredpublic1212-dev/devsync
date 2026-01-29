"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRoomStore } from "./room.store";
import type { Room } from "./room.types";

const RoomShell = dynamic(() => import("./RoomShell"), {
  ssr: false,
});

interface Props {
  roomId: string;
  initialRoom: Room;
}

export default function RoomShellClient({
  roomId,
  initialRoom,
}: Props) {
  const room = useRoomStore((s) => s.room);
  const setRoom = useRoomStore((s) => s.setRoom);

  useEffect(() => {
    if (!room) {
      setRoom(initialRoom);
    }
  }, [room, initialRoom, setRoom]);
  
  return <RoomShell roomId={roomId} />;
}
