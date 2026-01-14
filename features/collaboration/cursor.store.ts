import { create } from "zustand";
import type { CursorPosition } from "./collaboration.types";

interface CursorState {
  cursors: CursorPosition[];
  updateCursor: (cursor: CursorPosition) => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  cursors: [],

  updateCursor: (cursor) =>
    set((state) => ({
      cursors: [
        ...state.cursors.filter((c) => c.userId !== cursor.userId),
        cursor,
      ],
    })),
}));
