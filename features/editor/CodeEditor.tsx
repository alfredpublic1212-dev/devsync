/* ===============================
   FILE: features/editor/CodeEditor.tsx
=============================== */

"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import type * as monaco from "monaco-editor";

import { useEditorStore } from "@/features/collaboration/editor/editor.store";
import { sendEditorUpdate } from "@/features/collaboration/editor/editor.sync";

export default function CodeEditor({ roomId }: { roomId: string }) {
  const activeFileId = useEditorStore((s) => s.activeFileId);
  const openFiles = useEditorStore((s) => s.openFiles);
  const contents = useEditorStore((s) => s.contents);

  const file = activeFileId
    ? openFiles[activeFileId]
    : null;

  const content = file
    ? contents[file.fileId]?.content ?? ""
    : "";

  const revision = file
    ? contents[file.fileId]?.revision ?? 0
    : 0;

  const editorRef =
    useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const modelRef =
    useRef<monaco.editor.ITextModel | null>(null);

  /* ---------- Sync Monaco model on file switch ---------- */

  useEffect(() => {
    if (!file || !editorRef.current) return;

    const editor = editorRef.current;

    const model =
      modelRef.current ??
      monaco.editor.createModel(
        content,
        file.language
      );

    if (modelRef.current !== model) {
      modelRef.current = model;
      editor.setModel(model);
    }

    if (model.getValue() !== content) {
      model.setValue(content);
    }

    return () => {
      // do NOT dispose model here (tab switching)
    };
  }, [file?.fileId]);

  /* ---------- Push changes to server (debounced by Monaco) ---------- */

  function handleChange(value?: string) {
    if (!file || value === undefined) return;

    sendEditorUpdate(
      roomId,
      file.fileId,
      value
    );
  }

  /* ---------- Empty state ---------- */

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Open a file to start coding
      </div>
    );
  }

  /* ---------- Render editor ---------- */

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language={file.language}
      value={content}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      onChange={handleChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        cursorSmoothCaretAnimation: "on",
      }}
    />
  );
}
