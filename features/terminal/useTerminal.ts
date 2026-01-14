import { useTerminalStore } from "./terminal.store";
import { startTerminal, stopTerminal, sendTerminalInput } from "./terminal.service";

export function useTerminal(roomId: string) {
  const { session, logs, clear } = useTerminalStore();

  return {
    session,
    logs,
    start: () => startTerminal(roomId),
    stop: () => stopTerminal(roomId),
    send: (input: string) => sendTerminalInput(roomId, input),
    clear,
  };
}
