"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Eye, Bug, Cpu } from "lucide-react";
import AIReviewPanel from "@/features/tools/AiReview";

type ToolTab = "preview" | "ai" | "debug" | "runtime";

interface ToolsPanelProps {
  roomId: string;
}

export default function ToolsPanel({ roomId }: ToolsPanelProps) {
  const [tab, setTab] = useState<ToolTab>("ai");

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#05070b] text-sm relative overflow-hidden">

      {/* ICON BAR */}
      <div className="h-10 flex items-center justify-around border-b border-white/10 bg-[#05070b]">
        <Tab icon={Bot} active={tab === "ai"} onClick={() => setTab("ai")} />
        <Tab icon={Eye} active={tab === "preview"} onClick={() => setTab("preview")} />
        <Tab icon={Bug} active={tab === "debug"} onClick={() => setTab("debug")} />
        <Tab icon={Cpu} active={tab === "runtime"} onClick={() => setTab("runtime")} />
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "ai" && <AIReviewPanel />}

        {tab === "preview" && (
          <div className="p-4 text-neutral-400">Preview coming soon…</div>
        )}

        {tab === "debug" && (
          <div className="p-4 text-neutral-400">Debugger coming soon…</div>
        )}

        {tab === "runtime" && (
          <div className="p-4 text-neutral-400">
            Runtime info for room {roomId}
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({
  icon: Icon,
  active,
  onClick,
}: {
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full flex items-center justify-center text-neutral-500 hover:text-white transition",
        active && "bg-white/5 text-white"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}