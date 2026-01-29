import { create } from "zustand";
import type { Room, RoomMember } from "./room.types";

interface RoomState {
  room: Room | null;
  members: RoomMember[];
  isReady: boolean;

  setRoom: (room: Room) => void;
  setMembers: (members: RoomMember[]) => void;
  markReady: () => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  members: [],
  isReady: false,

  setRoom: (room) => set({ room }),
  setMembers: (members) => set({ members }),
  markReady: () => set({ isReady: true }),
  reset: () => set({ room: null, members: [], isReady: false }),
}));
