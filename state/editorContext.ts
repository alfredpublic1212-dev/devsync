import { create } from 'zustand';

type SelectionContext = {
  fileName: string | null;
  code: string | null;
  range: {
    startLine: number;
    endLine: number;
  } | null;

  setSelection: (
    fileName: string,
    code: string,
    startLine: number,
    endLine: number
  ) => void;

  clearSelection: () => void;
};

export const useEditorContext = create<SelectionContext>((set) => ({
  fileName: null,
  code: null,
  range: null,

  setSelection: (fileName, code, startLine, endLine) =>
    set({
      fileName,
      code,
      range: { startLine, endLine },
    }),

  clearSelection: () =>
    set({
      fileName: null,
      code: null,
      range: null,
    }),
}));
