import { create } from "zustand";
import type { Room } from "./room.types";

interface RoomState {
  room: Room | null;
  setRoom: (room: Room) => void;
  updateMember: (userId: string, role: Room["members"][number]["role"]) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,

  setRoom: (room) => set({ room }),

  updateMember: (userId, role) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          members: state.room.members.map((m) =>
            m.userId === userId ? { ...m, role } : m
          ),
        },
      };
    }),
}));
