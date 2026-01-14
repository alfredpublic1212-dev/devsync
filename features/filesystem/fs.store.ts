import { create } from "zustand";
import type { FSNode, FileContent } from "./fs.types";

interface FSState {
  tree: FSNode[];

  setTree: (tree: FSNode[]) => void;
  addNode: (node: FSNode) => void;
  removeNode: (id: string) => void;
  renameNode: (id: string, name: string) => void;
}


export const useFSStore = create<FSState>((set) => ({
  tree: [],
  openFiles: [],
  activeFileId: null,

  addNode: (node) =>
  set((s) => ({ tree: [...s.tree, node] })),

removeNode: (id) =>
  set((s) => ({
    tree: s.tree.filter((n) => n.id !== id && n.parentId !== id),
  })),

renameNode: (id, name) =>
  set((s) => ({
    tree: s.tree.map((n) =>
      n.id === id ? { ...n, name } : n
    ),
  })),


  setTree: (tree) => set({ tree }),

}));
