// ui/layout/Sidebar.tsx

"use client";

import type { SidebarView } from "./layout.types";
import FileTree from "@/features/filesystem/FileTree";
import { usePresenceStore } from "@/features/collaboration/presence/presence.store";
import { createNode } from "@/features/collaboration/filesystem/fs.action";
import { useRoomStore } from "@/features/rooms/room.store";

import {
  FilePlus,
  FolderPlus,
  RefreshCcw,
} from "lucide-react";

interface SidebarProps {
  roomId: string;
  view: SidebarView;
  projectName?: string;
}

export default function Sidebar({ roomId, view, projectName }: SidebarProps) {
  const usersMap = usePresenceStore((s) => s.users);
  const users = Object.values(usersMap);

  const handleCreateFile = () => {
    const name = prompt("File name", "new-file.ts");
    if (!name) return;

    createNode({
      roomId,
      parentId: null,
      name,
      type: "file",
    });
  };

  const handleCreateFolder = () => {
    const name = prompt("Folder name", "new-folder");
    if (!name) return;

    createNode({
      roomId,
      parentId: null,
      name,
      type: "folder",
    });
  };

  return (
    <div className="h-full flex flex-col bg-neutral-900 text-sm border-r border-neutral-800">
      {/* Header */}
      <div className="h-8 flex items-center px-2 border-b border-neutral-800 text-neutral-400">
        {view.toUpperCase()}
      </div>

      {/* Explorer */}
      {view === "explorer" && (
        <>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold uppercase text-neutral-400 truncate">
              {projectName || "Project"}
            </span>

            <div className="flex gap-1">
              <FilePlus
                size={14}
                className="cursor-pointer text-neutral-600 hover:text-white"
                onClick={handleCreateFile}
              />

              <FolderPlus
                size={14}
                className="cursor-pointer text-neutral-600 hover:text-white"
                onClick={handleCreateFolder}
              />

              <RefreshCcw
                size={14}
                className="cursor-pointer text-neutral-600 hover:text-white"
                onClick={() => location.reload()}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <FileTree roomId={roomId} />
          </div>
        </>
      )}

      {/* Git */}
      {view === "git" && (
        <div className="p-3 text-neutral-500">
          Git coming soon…
        </div>
      )}

      {/* Run */}
      {view === "run" && (
        <div className="p-3 text-neutral-500">
          Run configs coming soon…
        </div>
      )}

      {/* Collaboration */}
      {view === "collab" && (
        <div className="p-2 space-y-2">
          <div className="text-xs text-neutral-400 mb-2">
            {users.length} user{users.length !== 1 ? "s" : ""} online
          </div>

          {users.map((u) => (
            <div
              key={u.userId}
              className="flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: u.color }}
              />
              <span className="truncate text-xs">
                {u.name}
                {!u.online && " (offline)"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {view === "settings" && (
        <div className="p-3 text-neutral-500">
          Settings coming soon…
        </div>
      )}
    </div>
  );
}
