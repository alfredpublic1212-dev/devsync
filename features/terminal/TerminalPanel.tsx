"use client";

import { useState } from "react";
import { getSocket } from "@/features/collaboration/client/socket";
import { useTerminalStore } from "./terminal.store";
import { cn } from "@/lib/utils";

export default function TerminalPanel({
  roomId,
}: {
  roomId: string;
}) {
  const { session, logs } = useTerminalStore();
  const [input, setInput] = useState("");

  function start() {
    getSocket().emit("terminal:start", { roomId });
  }

  function stop() {
    getSocket().emit("terminal:stop", { roomId });
  }

  function send() {
    if (!input.trim()) return;

    getSocket().emit("terminal:input", {
      roomId,
      input,
    });

    setInput("");
  }

  return (
    <div className="h-full bg-black text-green-400 font-mono text-sm">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between px-2 py-1 bg-neutral-900 text-white">
        <span>Terminal</span>

        {session?.status === "running" ? (
          <button
            onClick={stop}
            className="text-red-400 hover:text-red-300"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={start}
            className="text-green-400 hover:text-green-300"
          >
            Run
          </button>
        )}
      </div>


      {/* ---------- Input ---------- */}
      <input
        className="bg-black text-white outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            send();
          }
        }}
        placeholder="Enter command…"
      />
      
      {/* ---------- Output ---------- */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className={cn(
              log.type === "stderr" &&
                "text-red-400",
              log.type === "system" &&
                "text-blue-400"
            )}
          >
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
