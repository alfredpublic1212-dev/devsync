/* ===============================
   FILE: RoomShell.tsx
=============================== */

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

import ActivityBar from "@/ui/layout/ActivityBar";
import Sidebar from "@/ui/layout/Sidebar";
import BottomPanel from "@/ui/layout/BottomPanel";
import ToolsPanel from "@/ui/layout/ToolsPanel";
import Header from "@/ui/layout/Header";

import EditorTabs from "@/features/editor/EditorTabs";
import CodeEditor from "@/features/editor/CodeEditor";

import { SidebarView } from "@/ui/layout/layout.types";
import { useRoomStore } from "./room.store";

interface RoomShellProps {
  roomId: string;
}

export default function RoomShell({ roomId }: RoomShellProps) {
  const room = useRoomStore((s) => s.room);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [sidebarView, setSidebarView] =
    useState<SidebarView>("explorer");

  // ✅ Defensive guard (RoomGuard should already ensure this)
  if (!room) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-neutral-200">
      <Header
        title={room.name}
        roomId={roomId}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleBottomPanel={() => setBottomOpen((v) => !v)}
        onToggleTools={() => setToolsOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ActivityBar
            active={sidebarView}
            onSelect={setSidebarView}
          />

          {sidebarOpen && (
            <>
              <ResizablePanel defaultSize={18} maxSize={25}>
                <Sidebar
                  view={sidebarView}
                  roomId={roomId}
                  projectName={room.name}
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          <ResizablePanel minSize={40}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel minSize={40}>
                <EditorTabs />
                <CodeEditor roomId={roomId} />
              </ResizablePanel>

              {bottomOpen && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={25}>
                    <BottomPanel roomId={roomId} />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {toolsOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={22}>
                <ToolsPanel roomId={roomId} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
