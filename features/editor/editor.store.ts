import { create } from "zustand";
import type { EditorFile } from "./editor.types";

interface EditorState {
  files: EditorFile[];
  activeFileId: string | null;

  openFile: (file: EditorFile) => void;
  setActiveFile: (fileId: string) => void;
  updateContent: (fileId: string, content: string, version: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  files: [],
  activeFileId: null,

  openFile: (file) =>
    set((s) => ({
      files: [...s.files.filter(f => f.fileId !== file.fileId), file],
      activeFileId: file.fileId,
    })),

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  updateContent: (fileId, content, version) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.fileId === fileId ? { ...f, content, version } : f
      ),
    })),
}));
