import { create } from "zustand";
import type { Presence } from "./collaboration.types";

interface PresenceState {
  users: Presence[];
  setUsers: (users: Presence[]) => void;
  userJoined: (user: Presence) => void;
  userLeft: (userId: string) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  users: [],

  setUsers: (users) => set({ users }),

  userJoined: (user) =>
    set((s) => ({ users: [...s.users.filter(u => u.userId !== user.userId), user] })),

  userLeft: (userId) =>
    set((s) => ({ users: s.users.filter((u) => u.userId !== userId) })),
}));
