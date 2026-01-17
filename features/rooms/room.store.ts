
import { create } from "zustand";
import type { Room, RoomMember, RoomRole } from "./room.types";

interface RoomState {
  room: Room | null;
  isLoading: boolean;
  error: string | null;

  setRoom: (room: Room) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  updateMemberRole: (userId: string, role: RoomRole) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  isLoading: true,
  error: null,

  setRoom: (room) =>
    set({
      room,
      isLoading: false,
      error: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  updateMemberRole: (userId, role) =>
    set((state) => {
      if (!state.room) return state;

      const members: RoomMember[] = state.room.members.map((m) =>
        m.userId === userId ? { ...m, role } : m
      );

      return {
        room: {
          ...state.room,
          members,
        },
      };
    }),

  reset: () =>
    set({
      room: null,
      isLoading: true,
      error: null,
    }),
}));
