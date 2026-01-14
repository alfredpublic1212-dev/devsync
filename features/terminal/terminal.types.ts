export type TerminalStatus = "idle" | "running" | "error" | "stopped";

export interface TerminalSession {
  id: string;
  roomId: string;
  ownerId: string;
  status: TerminalStatus;
}

export interface TerminalLog {
  timestamp: number;
  message: string;
  type: "stdout" | "stderr" | "system";
}
