import { create } from "zustand";
import type { FSNode } from "./fs.types";

interface FSState {
  nodes: Record<string, FSNode>;

  setSnapshot: (nodes: FSNode[]) => void;
  upsertNode: (node: FSNode) => void;
  removeNode: (id: string) => void;
  clear: () => void;
}

export const useFSStore = create<FSState>((set) => ({
  nodes: {},

  setSnapshot: (nodes) =>
    set(() => {
      const map: Record<string, FSNode> = {};
      for (const n of nodes) {
        map[n.id] = n;
      }
      return { nodes: map };
    }),

  upsertNode: (node) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [node.id]: node,
      },
    })),

  removeNode: (id) =>
    set((state) => {
      const next = { ...state.nodes };
      delete next[id];

      // defensive: remove children (server should already do this)
      for (const node of Object.values(next)) {
        if (node.parentId === id) {
          delete next[node.id];
        }
      }

      return { nodes: next };
    }),

  clear: () => set({ nodes: {} }),
}));
