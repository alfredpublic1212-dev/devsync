"use client";

import { useEditorStore } from "./editor.store";

export default function EditorTabs() {
  const { files, activeFileId, setActiveFile } = useEditorStore();

  return (
    <div className="flex border-b border-neutral-700 bg-neutral-900">
      {files.map((f) => (
        <button
          key={f.fileId}
          onClick={() => setActiveFile(f.fileId)}
          className={`px-3 py-1 text-sm ${
            f.fileId === activeFileId ? "bg-neutral-800" : "bg-neutral-900"
          }`}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}
