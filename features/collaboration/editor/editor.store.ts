import { create } from "zustand";

interface OpenFile {
  fileId: string;
  name: string;
  language: string;
}

interface EditorUIState {
  activeFileId: string | null;
  openFiles: Record<string, OpenFile>;

  openFile: (file: OpenFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
}

export const useEditorStore = create<EditorUIState>((set) => ({
  activeFileId: null,
  openFiles: {},

  openFile: (file) =>
    set((state) => ({
      activeFileId: file.fileId,
      openFiles: {
        ...state.openFiles,
        [file.fileId]: file,
      },
    })),

  closeFile: (fileId) =>
    set((state) => {
      const next = { ...state.openFiles };
      delete next[fileId];

      const remaining = Object.keys(next);
      return {
        openFiles: next,
        activeFileId:
          state.activeFileId === fileId
            ? remaining[0] ?? null
            : state.activeFileId,
      };
    }),

  setActiveFile: (fileId) =>
    set(() => ({ activeFileId: fileId })),
}));
