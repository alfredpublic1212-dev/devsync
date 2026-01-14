import { useRoomStore } from "./room.store";

export function useRoom() {
  const room = useRoomStore((s) => s.room);

  return {
    room,
    members: room?.members ?? [],
    isReady: Boolean(room),
  };
}
