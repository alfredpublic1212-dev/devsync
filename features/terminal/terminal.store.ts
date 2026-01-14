import { create } from "zustand";
import type { TerminalLog, TerminalSession } from "./terminal.types";

interface TerminalState {
  session: TerminalSession | null;
  logs: TerminalLog[];

  setSession: (s: TerminalSession) => void;
  addLog: (l: TerminalLog) => void;
  clear: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  session: null,
  logs: [],

  setSession: (session) => set({ session }),
  addLog: (log) => set((s) => ({ logs: [...s.logs, log] })),
  clear: () => set({ logs: [] }),
}));
