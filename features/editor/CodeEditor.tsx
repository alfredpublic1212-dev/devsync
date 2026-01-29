// features/editor/CodeEditor.tsx

"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Awareness } from "y-protocols/awareness";
import * as monaco from "monaco-editor";

import { getYDoc } from "@/features/collaboration/editor/yjs";
import { bindMonacoToYText } from "@/features/collaboration/editor/monaco-yjs";
import { bindYjsToSocket } from "@/features/collaboration/editor/yjs-transport";
import { setupAwareness } from "@/features/collaboration/editor/yjs-awareness";
import { bindAwarenessToMonaco } from "@/features/collaboration/editor/monaco-awareness";
import { renderRemoteCursors } from "@/features/collaboration/editor/render-cursors";
import { hasRoomSnapshot } from "@/features/collaboration/client/connection";

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
  const currentUser = Object.values(users).find((u) => u.online) ?? null;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const modelsRef = useRef<
    Map<
      string,
      {
        model: monaco.editor.ITextModel;
        cleanup?: () => void;
      }
    >
  >(new Map());

  const [error, setError] = useState<string | null>(null);

  /* ---------- Editor mount ---------- */
  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
  };

  /* ---------- Global cleanup ---------- */
  useEffect(() => {
    return () => {
      modelsRef.current.forEach(({ model, cleanup }) => {
        try {
          cleanup?.();
          if (!model.isDisposed()) model.dispose();
        } catch {}
      });
      modelsRef.current.clear();
      editorRef.current = null;
      monacoRef.current = null;
    };
  }, []);

  /* ---------- HARD GATE: wait for room snapshot ---------- */
  if (!hasRoomSnapshot()) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Syncing workspace…
      </div>
    );
  }

  /* ---------- No file selected ---------- */
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Open a file to start coding
      </div>
    );
  }

  /* ---------- Collaboration setup per file ---------- */
  useEffect(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;

    if (!editor || !monacoInstance || !currentUser || !file) return;

    setError(null);

    let isMounted = true;
    let cleanup: (() => void) | null = null;

    const setup = async () => {
      try {
        /* ---------- Model ---------- */
        let entry = modelsRef.current.get(file.fileId);

        if (!entry) {
          const model = monacoInstance.editor.createModel(
            "",
            file.language
          );
          entry = { model };
          modelsRef.current.set(file.fileId, entry);
        } else if (entry.model.getLanguageId() !== file.language) {
          monacoInstance.editor.setModelLanguage(
            entry.model,
            file.language
          );
        }

        const model = entry.model;
        if (model.isDisposed()) return;

        entry.cleanup?.();

        editor.setModel(model);

        /* ---------- Yjs ---------- */
        const doc = getYDoc(roomId, file.fileId);
        const ytext = doc.getText("content");

        const unbindText = bindMonacoToYText(model, ytext);
        const unbindTransport = bindYjsToSocket(
          doc,
          roomId,
          file.fileId
        );

        /* ---------- Awareness ---------- */
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

        /* ---------- Cursor rendering ---------- */
        const interval = setInterval(() => {
          if (isMounted) renderRemoteCursors(editor, awareness);
        }, 100);

        cleanup = () => {
          isMounted = false;
          clearInterval(interval);
          awareness.destroy();
          unbindTransport();
          unbindText();
        };

        entry.cleanup = cleanup;
      } catch (err) {
        console.error("Editor setup failed", err);
        if (isMounted) setError("Failed to setup collaboration");
      }
    };

    setup();

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [roomId, file.fileId, file.language, currentUser?.userId]);

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded"
        >
          Reload Page
        </button>
      </div>
    );
  }

  /* ---------- Render editor ---------- */
  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: "on",
          wordWrap: "on",
          tabSize: 2,
          quickSuggestions: false,
          wordBasedSuggestions: "off",
        }}
      />
    </div>
  );
}
