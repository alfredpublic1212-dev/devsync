"use client";

import { useEditorStore } from "@/features/collaboration/editor/editor.store";
import { cn } from "@/lib/utils";

export default function EditorTabs() {
  const openFiles = useEditorStore((s) => s.openFiles);
  const activeFileId = useEditorStore((s) => s.activeFileId);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const closeFile = useEditorStore((s) => s.closeFile);

  const files = Object.values(openFiles);

  if (!files.length) return null;

  return (
    <div className="flex border-b border-neutral-700 bg-neutral-900">
      {files.map((file) => (
        <div
          key={file.fileId}
          className={cn(
            "flex items-center gap-2 px-3 py-1 text-sm cursor-pointer",
            file.fileId === activeFileId
              ? "bg-neutral-800 text-white"
              : "text-neutral-300 hover:bg-neutral-800"
          )}
          onClick={() => setActiveFile(file.fileId)}
        >
          <span className="truncate max-w-[140px]">
            {file.name}
          </span>

          <button
            className="text-neutral-400 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              closeFile(file.fileId);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
