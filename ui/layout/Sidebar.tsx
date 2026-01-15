"use client";

import type { SidebarView } from "./layout.types";
import FileTree from "@/features/filesystem/FileTree";
import { usePresenceStore } from "@/features/collaboration/presence.store";
import { FilePlus, FolderPlus, RefreshCcw } from "lucide-react";
import { useFileSystem } from "@/features/filesystem/useFileSystem";
import { useFSActions } from "@/features/filesystem/fs.action";

interface SidebarProps {
  roomId: string;
  view: SidebarView;
}

export default function Sidebar({ roomId, view }: SidebarProps) {
  const users = usePresenceStore((s) => s.users);
  const { tree } = useFileSystem();
  const actions = useFSActions(roomId);

  const projectName = "devsync";
  const rootNode = tree.find((n) => n.type === "root");

  if (!rootNode) {
  return (
    <div className="p-3 text-xs text-neutral-500">
      Loading workspace…
    </div>
  );
}



  return (
    <div className="h-full flex flex-col bg-neutral-900 text-sm border-r border-neutral-800">
      <div className="h-8 flex items-center px-3 border-b border-neutral-800 text-neutral-400">
        {view.toUpperCase()}
      </div>

      {view === "explorer" && (
        <>
          {/* Explorer Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-700">
            <span className="text-xs font-semibold uppercase text-neutral-400">
              {projectName}
            </span>

            <div className="flex gap-1">
              <FilePlus
                size={16}
                className="cursor-pointer hover:text-white"
                onClick={() => {
                  if (!rootNode) return;
                  const name = prompt("File name", "new-file.ts");
                  if (name) actions.createFile(rootNode, name);
                }}
              />
              <FolderPlus
                size={16}
                className="cursor-pointer hover:text-white"
                onClick={() => {
                  if (!rootNode) return;
                  const name = prompt("Folder name", "new-folder");
                  if (name) actions.createFolder(rootNode, name);
                }}
              />
              <RefreshCcw
                size={16}
                className="cursor-pointer hover:text-white"
                onClick={() => location.reload()}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <FileTree actions={actions} />
          </div>
        </>
      )}

      {view === "git" && <div className="p-3 text-neutral-500">Git coming soon…</div>}
      {view === "run" && <div className="p-3 text-neutral-500">Run configs coming soon…</div>}
      {view === "collab" && (
        <div className="p-2 space-y-2">
          {users.map((u) => (
            <div key={u.userId} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: u.color }}
              />
              {u.name}
            </div>
          ))}
        </div>
      )}
      {view === "settings" && <div className="p-3 text-neutral-500">Settings coming soon…</div>}
    </div>
  );
}
