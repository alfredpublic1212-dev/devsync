"use client";

import { useEditorStore } from "./editor.store";
import { syncEditorChange } from "./editor.sync";

export default function CodeEditor() {
  const { files, activeFileId } = useEditorStore();
  const file = files.find((f) => f.fileId === activeFileId);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Open a file to start coding
      </div>
    );
  }

  return (
    <textarea
      className="w-full h-full bg-[#1e1e1e] text-white p-4 font-mono outline-none"
      value={file.content}
      onChange={(e) =>
        syncEditorChange(
          file.fileId,
          e.target.value,
          file.version + 1
        )
      }
    />
  );
}
