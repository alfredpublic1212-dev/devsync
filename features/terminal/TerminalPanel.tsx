"use client";

import { useTerminal } from "./useTerminal";
import { useState } from "react";

export default function TerminalPanel({ roomId }: { roomId: string }) {
  const { logs, start, stop, send, session } = useTerminal(roomId);
  const [input, setInput] = useState("");

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm">
      <div className="flex justify-between px-2 py-1 bg-neutral-900 text-white">
        <span>Terminal</span>
        {session?.status === "running" ? (
          <button onClick={stop}>Stop</button>
        ) : (
          <button onClick={start}>Run</button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {logs.map((l, i) => (
          <div key={i}>{l.message}</div>
        ))}
      </div>

      <input
        className="bg-black border-t border-neutral-700 p-1 text-white outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            send(input);
            setInput("");
          }
        }}
      />
    </div>
  );
}
