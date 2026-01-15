"use client";

import { useState } from "react";

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

import { useRoomSocket } from "@/features/collaboration/useRoomSocket";
import { useEditorSocket } from "@/features/editor/editor.socket";
import { useFilesystemSocket } from "@/features/filesystem/filesystem.socket";

interface RoomShellProps {
  roomId: string;
  projectName: string;
}

export default function RoomShell({
  roomId,
  projectName,
}: RoomShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [sidebarView, setSidebarView] =
    useState<SidebarView>("explorer");

  // TEMP user id (replace with auth later)
  const userId = "lala";

  /* ---------------- Boot collaboration layers ---------------- */

  useRoomSocket(roomId, userId);
  useFilesystemSocket(roomId);
  useEditorSocket(roomId);

  /* ---------------- Render ---------------- */

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-neutral-200">
      <Header
        title={projectName}
        roomId={roomId}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onToggleBottomPanel={() => setBottomOpen((v) => !v)}
        onToggleTools={() => setToolsOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1"
          autoSaveId={`room-${roomId}-horizontal`}
        >
          <ActivityBar
            active={sidebarView}
            onSelect={setSidebarView}
          />

          {sidebarOpen && (
            <>
              <ResizablePanel
                defaultSize={18}
                maxSize={25}
                minSize={12}
              >
                <Sidebar view={sidebarView} roomId={roomId} />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          <ResizablePanel minSize={40}>
            <ResizablePanelGroup
              direction="vertical"
              className="h-full"
              autoSaveId={`room-${roomId}-vertical`}
            >
              <ResizablePanel minSize={40}>
                <div className="flex flex-col h-full min-h-0">
                  <EditorTabs />
                  <div className="flex-1 min-h-0">
                    <CodeEditor roomId={roomId} />
                  </div>
                </div>
              </ResizablePanel>

              {bottomOpen && (
                <>
                  <ResizableHandle />
                  <ResizablePanel
                    defaultSize={25}
                    maxSize={50}
                    minSize={15}
                  >
                    <BottomPanel roomId={roomId} />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {toolsOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel
                defaultSize={22}
                maxSize={30}
                minSize={15}
              >
                <ToolsPanel roomId={roomId} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
