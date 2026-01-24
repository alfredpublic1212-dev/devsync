import { create } from "zustand";
import type { Room, RoomMember, RoomRole } from "./room.types";

interface RoomState {
  room: Room | null;
  isLoading: boolean;
  error: string | null;

  /* ---------- State setters ---------- */
  setRoom: (room: Room) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  /* ---------- Mutations ---------- */
  updateMemberRole: (userId: string, role: RoomRole) => void;
  addMember: (member: RoomMember) => void;
  removeMember: (userId: string) => void;

  /* ---------- Lifecycle ---------- */
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  isLoading: true,
  error: null,

  /* ---------- Basic setters ---------- */

  setRoom: (room) =>
    set({
      room,
      isLoading: false,
      error: null,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  /* ---------- Mutations ---------- */

  updateMemberRole: (userId, role) =>
    set((state) => {
      if (!state.room) return state;

      const members = state.room.members.map((m) =>
        m.userId === userId ? { ...m, role } : m
      );

      return {
        room: {
          ...state.room,
          members,
        },
      };
    }),

  addMember: (member) =>
    set((state) => {
      if (!state.room) return state;

      // prevent duplicates
      const exists = state.room.members.some(
        (m) => m.userId === member.userId
      );

      if (exists) return state;

      return {
        room: {
          ...state.room,
          members: [...state.room.members, member],
        },
      };
    }),

  removeMember: (userId) =>
    set((state) => {
      if (!state.room) return state;

      return {
        room: {
          ...state.room,
          members: state.room.members.filter(
            (m) => m.userId !== userId
          ),
        },
      };
    }),

  /* ---------- Reset ---------- */

  reset: () =>
    set({
      room: null,
      isLoading: true,
      error: null,
    }),
}));
