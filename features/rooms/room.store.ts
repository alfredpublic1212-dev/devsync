import { create } from "zustand";
import type { Room, RoomJoinRequest, RoomMember } from "./room.types";

interface RoomState {
  room: Room | null;
  members: RoomMember[];
  joinRequests: RoomJoinRequest[];
  isReady: boolean;
  error: string | null;
  isAwaitingRoleAssignment: boolean;
  awaitingRoleMessage: string | null;

  // setters
  setRoom: (room: Room | null | undefined) => void;
  setMembers: (members: RoomMember[]) => void;
  setError: (error: string | null) => void;
  setAwaitingRoleAssignment: (value: boolean, message?: string | null) => void;
  upsertJoinRequest: (request: RoomJoinRequest) => void;
  removeJoinRequest: (userId: string) => void;
  pruneJoinRequestsByMembers: (members: RoomMember[]) => void;

  // lifecycle
  markReady: () => void;
  hydrateInitialRoom: (room: Room) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  members: [],
  joinRequests: [],
  isReady: false,
  error: null,
  isAwaitingRoleAssignment: false,
  awaitingRoleMessage: null,

  setRoom: (room) =>
    set((state) => {
      // Ignore malformed payloads and keep the previous room.
      if (!room) return state;

      return {
        room,
        // keep isReady false until snapshot confirms
        isReady: state.isReady,
      };
    }),

  setMembers: (members) => set({ members }),
  setError: (error) => set({ error }),
  setAwaitingRoleAssignment: (value, message = null) =>
    set({
      isAwaitingRoleAssignment: value,
      awaitingRoleMessage: value ? message ?? "Waiting for room owner to assign your role..." : null,
    }),
  upsertJoinRequest: (request) =>
    set((state) => {
      const existingIndex = state.joinRequests.findIndex(
        (item) => item.userId === request.userId
      );

      if (existingIndex === -1) {
        return { joinRequests: [...state.joinRequests, request] };
      }

      const next = [...state.joinRequests];
      next[existingIndex] = request;
      return { joinRequests: next };
    }),
  removeJoinRequest: (userId) =>
    set((state) => ({
      joinRequests: state.joinRequests.filter(
        (item) => item.userId !== userId
      ),
    })),
  pruneJoinRequestsByMembers: (members) =>
    set((state) => {
      const memberIds = new Set(members.map((member) => member.userId));
      return {
        joinRequests: state.joinRequests.filter(
          (request) => !memberIds.has(request.userId)
        ),
      };
    }),

  hydrateInitialRoom: (room) =>
    set((state) => {
      // 🔒 do NOT overwrite existing room
      if (state.room) return state;
      return { room };
    }),

  markReady: () =>
    set((state) => {
      if (state.isReady) return state;
      return {
        isReady: true,
        error: null,
        isAwaitingRoleAssignment: false,
        awaitingRoleMessage: null,
      };
    }),

  reset: () => ({
    room: null,
    members: [],
    joinRequests: [],
    isReady: false,
    error: null,
    isAwaitingRoleAssignment: false,
    awaitingRoleMessage: null,
  }),
}));
