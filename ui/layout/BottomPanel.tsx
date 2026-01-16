"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import TerminalPanel from "@/features/terminal/TerminalPanel";

type BottomTab = "terminal" | "problems" | "output";

interface BottomPanelProps {
  roomId: string;
}

export default function BottomPanel({ roomId }: BottomPanelProps) {
  const [tab, setTab] = useState<BottomTab>("terminal");

  return (
    <div className="h-full flex flex-col bg-neutral-900 border-t border-neutral-800">
      {/* Tabs */}
      <div className="h-8 flex items-center gap-2 bg-neutral-900 border-b border-neutral-800 text-xs">
        {(["terminal", "problems", "output"] as BottomTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "h-full px-3 py-1",
              tab === t
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            )}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "terminal" && <TerminalPanel roomId={roomId} />}
        {tab === "problems" && (
          <div className="p-3 text-neutral-500">
            No problems detected
          </div>
        )}
        {tab === "output" && (
          <div className="p-3 text-neutral-500">
            No output yet
          </div>
        )}
      </div>
    </div>
  );
}
