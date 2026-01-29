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
      const toDelete = new Set([id]);

      let changed = true;
      while (changed) {
        changed = false;
        for (const node of Object.values(next)) {
          if (
            node.parentId &&
            toDelete.has(node.parentId) &&
            !toDelete.has(node.id)
          ) {
            toDelete.add(node.id);
            changed = true;
          }
        }
      }

      for (const id of toDelete) {
        delete next[id];
      }

      return { nodes: next };
    }),

  clear: () => set({ nodes: {} }),
}));
