"use client";

import type { SidebarView } from "./layout.types";
import FileTree from "@/features/filesystem/FileTree";
import { usePresenceStore } from "@/features/collaboration/presence.store";

interface SidebarProps {
  view: SidebarView;
}

export default function Sidebar({ view }: SidebarProps) {
  const users = usePresenceStore((s) => s.users);

  return (
    <div className="h-full flex flex-col bg-neutral-900 text-sm border-r border-neutral-800">
      <div className="h-8 flex items-center px-3 border-b border-neutral-800 text-neutral-400">
        {view.toUpperCase()}
      </div>

      <div className="flex-1 overflow-auto">
        {view === "explorer" && <FileTree />}
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
    </div>
  );
}
