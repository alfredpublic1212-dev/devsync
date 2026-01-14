"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Menu,
  Share2,
  Terminal,
  PanelBottom,
  ClipboardCopy,
} from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  title: string;
  roomId: string;
  onToggleSidebar?: () => void;
  onToggleBottomPanel?: () => void;
  onToggleTools?: () => void;
}

export default function Header({
  title,
  roomId,
  onToggleSidebar,
  onToggleBottomPanel,
  onToggleTools,
}: HeaderProps) {
  const handleCopyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard!");
  };

  const shortRoomId = roomId?.slice(0, 6);

  return (
    <div className="h-10 flex items-center justify-between px-2 bg-neutral-900 border-b border-neutral-800 text-sm">
      <div className="flex items-center gap-2">
        {/* <Button size="icon" variant="ghost" onClick={onToggleSidebar}>
          <Menu className="w-4 h-4" />
        </Button> */}

        <span className="font-medium">{title}</span>

        {shortRoomId && (
          <span className="ml-2 px-2 bg-neutral-700 text-xs rounded text-neutral-300">
            #{shortRoomId}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleCopyRoomId}
              variant="secondary"
              size="sm"
              className="text-xs bg-neutral-900 hover:bg-neutral-700 text-neutral-200"
            >
              <ClipboardCopy size={8} className="" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Copy Room ID</TooltipContent>
        </Tooltip>

        {/* <Button size="icon" variant="ghost" onClick={onToggleBottomPanel}>
          <PanelBottom className="w-4 h-4" />
        </Button>

        <Button size="icon" variant="ghost" onClick={onToggleTools}>
          <Terminal className="w-4 h-4" />
        </Button> */}
      </div>
    </div>
  );
}
