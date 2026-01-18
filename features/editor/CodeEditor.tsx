"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import * as monaco from "monaco-editor";

import { getYDoc } from "@/features/collaboration/editor/yjs";
import { bindMonacoToYText } from "@/features/collaboration/editor/monaco-yjs";
import { bindYjsToSocket } from "@/features/collaboration/editor/yjs-transport";
import { setupAwareness } from "@/features/collaboration/editor/yjs-awareness";
import { bindAwarenessToMonaco } from "@/features/collaboration/editor/monaco-awareness";
import { renderRemoteCursors } from "@/features/collaboration/editor/render-cursors";

import { useEditorStore } from "@/features/collaboration/editor/editor.store";
import { usePresenceStore } from "@/features/collaboration/presence/presence.store";

interface CodeEditorProps {
  roomId: string;
}

export default function CodeEditor({ roomId }: CodeEditorProps) {
  const activeFileId = useEditorStore((s) => s.activeFileId);
  const openFiles = useEditorStore((s) => s.openFiles);
  const users = usePresenceStore((s) => s.users);

  const file = activeFileId ? openFiles[activeFileId] : null;
  const currentUser =
    Object.values(users).find((u) => u.online) ?? null;

  const editorRef =
    useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const modelsRef = useRef<Map<string, monaco.editor.ITextModel>>(
    new Map()
  );

  useEffect(() => {
    if (!file || !editorRef.current || !currentUser) return;

    const editor = editorRef.current;

    /* ---------- MODEL (PER FILE) ---------- */
    let model = modelsRef.current.get(file.fileId);

    if (!model) {
      model = monaco.editor.createModel(
        "",
        file.language
      );
      modelsRef.current.set(file.fileId, model);
    }

    editor.setModel(model);

    /* ---------- Yjs DOC ---------- */
    const doc = getYDoc(roomId, file.fileId);
    const ytext = doc.getText("content");

    const unbindText = bindMonacoToYText(model, ytext);

    /* ---------- Yjs TRANSPORT ---------- */
    const unbindTransport = bindYjsToSocket(
      doc,
      roomId,
      file.fileId
    );

    /* ---------- AWARENESS ---------- */
    const awareness = new Awareness(doc);

    awareness.setLocalState({
      user: {
        userId: currentUser.userId,
        name: currentUser.name,
        color: currentUser.color,
      },
      cursor: null,
    });

    setupAwareness(awareness, roomId, file.fileId);
    bindAwarenessToMonaco(editor, awareness);

    const render = () =>
      renderRemoteCursors(editor, awareness);

    awareness.on("change", render);

    /* ---------- CLEANUP ---------- */
    return () => {
      awareness.off("change", render);
      awareness.destroy();
      unbindTransport();
      unbindText();
    };
  }, [roomId, file?.fileId]);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Open a file to start coding
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}
