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
    <div className="h-full flex flex-col bg-neutral-900 rounded-lg  border-neutral-800 text-sm">
      {/* Tabs */}
      <div className="h-8 flex items-center justify-around border-b border-neutral-800">
        <Tab icon={Bot} active={tab === "ai"} onClick={() => setTab("ai")} />
        <Tab icon={Eye} active={tab === "preview"} onClick={() => setTab("preview")} />
        <Tab icon={Bug} active={tab === "debug"} onClick={() => setTab("debug")} />
        <Tab icon={Cpu} active={tab === "runtime"} onClick={() => setTab("runtime")} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === "ai" && (
          <div className="p-3 text-neutral-400">
            <AIReviewPanel/>
          </div>
        )}
        {tab === "preview" && (
          // <iframe
          //   src={`/api/preview/${roomId}`}
          //   className="w-full h-full bg-white"
          // />
          <div className="p-3 text-neutral-400">
            Preview coming soon…
          </div>
          
        )}


        {tab === "debug" && (
          <div className="p-3 text-neutral-400">
            Debugger coming soon…
          </div>
        )}

        {tab === "runtime" && (
          <div className="p-3 text-neutral-400">
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
        "w-full h-full flex items-center justify-center text-neutral-400 hover:text-white",
        active && "bg-neutral-800 text-white"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
