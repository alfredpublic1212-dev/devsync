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
  const roomError = useRoomStore((s) => s.error);
  const isAwaitingRoleAssignment = useRoomStore(
    (s) => s.isAwaitingRoleAssignment
  );
  const awaitingRoleMessage = useRoomStore(
    (s) => s.awaitingRoleMessage
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [sidebarView, setSidebarView] =
    useState<SidebarView>("explorer");

  if (roomError) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        {roomError}
      </div>
    );
  }

  if (isAwaitingRoleAssignment) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-300">
        <Loader2 className="animate-spin text-neutral-400" />
        <p className="text-sm">Waiting for role assignment</p>
        <p className="text-xs text-neutral-500">
          {awaitingRoleMessage ??
            "The room owner needs to assign your access role before you can enter."}
        </p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-neutral-200 overflow-hidden">
      <Header
        title={room.name}
        roomId={roomId}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleBottomPanel={() => setBottomOpen((v) => !v)}
        onToggleTools={() => setToolsOpen((v) => !v)}
      />

      {/* MAIN AREA */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 min-h-0 overflow-hidden"
        >
          <ActivityBar
            active={sidebarView}
            onSelect={setSidebarView}
          />

          {/* SIDEBAR */}
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

          {/* CENTER COLUMN */}
          <ResizablePanel minSize={40}>
            <ResizablePanelGroup
              direction="vertical"
              className="h-full min-h-0 overflow-hidden"
            >
              {/* EDITOR */}
              <ResizablePanel minSize={40} defaultSize={75}>
                <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  <EditorTabs />
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <CodeEditor roomId={roomId} />
                  </div>
                </div>
              </ResizablePanel>

              {/* TERMINAL */}
              {bottomOpen && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={25} minSize={15}>
                    <div className="h-full min-h-0 overflow-hidden">
                      <BottomPanel roomId={roomId} />
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* TOOLS PANEL */}
          {toolsOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel
                  defaultSize={22}
                  minSize={18}
                  className="min-h-0 overflow-visible"
                >
                <div className="h-full min-h-0 overflow-hidden">
                  <ToolsPanel roomId={roomId} />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}