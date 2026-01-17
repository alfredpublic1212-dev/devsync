/* ===============================
   FILE: features/collaboration/editor/editor.store.ts
=============================== */

import { create } from "zustand";
import type { EditorContent, EditorFile } from "./editor.types";

interface EditorState {
  openFiles: Record<string, EditorFile>;
  contents: Record<string, EditorContent>;
  activeFileId: string | null;

  openFile: (file: EditorFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;

  applyRemoteUpdate: (update: EditorContent) => void;
  clear: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  openFiles: {},
  contents: {},
  activeFileId: null,

  openFile: (file) =>
    set((state) => ({
      openFiles: {
        ...state.openFiles,
        [file.fileId]: file,
      },
      activeFileId: file.fileId,
    })),

  closeFile: (fileId) =>
    set((state) => {
      const next = { ...state.openFiles };
      delete next[fileId];

      return {
        openFiles: next,
        activeFileId:
          state.activeFileId === fileId
            ? Object.keys(next)[0] ?? null
            : state.activeFileId,
      };
    }),

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  applyRemoteUpdate: (update) =>
    set((state) => {
      const current = state.contents[update.fileId];

      if (current && update.revision <= current.revision) {
        return state;
      }

      return {
        contents: {
          ...state.contents,
          [update.fileId]: update,
        },
      };
    }),

  clear: () =>
    set({
      openFiles: {},
      contents: {},
      activeFileId: null,
    }),
}));
