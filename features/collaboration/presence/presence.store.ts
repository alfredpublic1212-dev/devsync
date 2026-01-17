/* ===============================
   FILE: features/collaboration/presence/presence.store.ts
=============================== */

import { create } from "zustand";
import type { PresenceUser } from "./presence.types";

interface PresenceState {
  users: Record<string, PresenceUser>;

  setSnapshot: (users: PresenceUser[]) => void;
  upsertUser: (user: PresenceUser) => void;
  markOffline: (userId: string) => void;
  clear: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  users: {},

  setSnapshot: (users) =>
    set(() => {
      const map: Record<string, PresenceUser> = {};
      for (const u of users) {
        map[u.userId] = u;
      }
      return { users: map };
    }),

  upsertUser: (user) =>
    set((state) => ({
      users: {
        ...state.users,
        [user.userId]: {
          ...state.users[user.userId],
          ...user,
          online: true,
          lastSeen: Date.now(),
        },
      },
    })),

  markOffline: (userId) =>
    set((state) => {
      const user = state.users[userId];
      if (!user) return state;

      return {
        users: {
          ...state.users,
          [userId]: {
            ...user,
            online: false,
            lastSeen: Date.now(),
          },
        },
      };
    }),

  clear: () => set({ users: {} }),
}));
