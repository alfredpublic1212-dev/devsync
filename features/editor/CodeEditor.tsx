"use client";

import Editor from "@monaco-editor/react";
import { useEditorStore } from "./editor.store";
import { syncEditorChange } from "./editor.sync";

interface BottomPanelProps {
  roomId: string;
}

export default function CodeEditor({roomId} : BottomPanelProps) {
  const { files, activeFileId } = useEditorStore();
  const file = files.find((f) => f.fileId === activeFileId);

  if (!file) {
    return <div className="h-full flex items-center justify-center text-neutral-500">
      Open a file to start coding
    </div>;
  }

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language={file.language}
      value={file.content}
      onChange={(value) => {
        if (value == null) return;
        syncEditorChange(
          roomId,
          file.fileId,
          value,
          file.version + 1,
        );
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
      }}
    />
  );
}
