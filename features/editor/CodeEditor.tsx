// features/editor/CodeEditor.tsx

"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
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
  const currentUser = Object.values(users).find((u) => u.online) ?? null;

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  
  // Store models and their cleanup functions separately
  const modelsRef = useRef<Map<string, {
    model: monaco.editor.ITextModel;
    cleanup?: () => void;
  }>>(new Map());
  
  const [error, setError] = useState<string | null>(null);

  // Handle editor mount
  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
  };

  // Main cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all models and their bindings
      modelsRef.current.forEach(({ model, cleanup }) => {
        try {
          if (cleanup) cleanup();
          if (!model.isDisposed()) {
            model.dispose();
          }
        } catch (err) {
          console.error("Model cleanup error:", err);
        }
      });
      modelsRef.current.clear();
      
      // Don't dispose editor here - React will handle it
      editorRef.current = null;
      monacoRef.current = null;
    };
  }, []);

  // Collaboration setup per file
  useEffect(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    
    if (!file || !editor || !monacoInstance || !currentUser) {
      return;
    }

    // Check if editor is disposed
    if (editor.getModel() === null && editor.getDomNode() === null) {
      console.warn("Editor is disposed, skipping setup");
      return;
    }

    setError(null);
    
    let isMounted = true;
    let cleanup: (() => void) | null = null;

    const setupCollaboration = async () => {
      try {
        /* ---------- Get or create model ---------- */
        let modelData = modelsRef.current.get(file.fileId);
        
        if (!modelData) {
          // Create new model
          const model = monacoInstance.editor.createModel(
            "",
            file.language
          );
          
          modelData = { model };
          modelsRef.current.set(file.fileId, modelData);
        } else {
          // Update language if changed
          if (modelData.model.getLanguageId() !== file.language) {
            monacoInstance.editor.setModelLanguage(
              modelData.model,
              file.language
            );
          }
        }

        const model = modelData.model;

        // Check model is valid
        if (model.isDisposed()) {
          console.error("Model is disposed");
          return;
        }

        /* ---------- Clean up previous binding for this file ---------- */
        if (modelData.cleanup) {
          modelData.cleanup();
          modelData.cleanup = undefined;
        }

        /* ---------- Set model on editor (safely) ---------- */
        if (!isMounted) return;
        
        try {
          // Only set if editor is still valid
          const currentModel = editor.getModel();
          if (currentModel !== model) {
            editor.setModel(model);
          }
        } catch (err) {
          console.error("Failed to set model:", err);
          setError("Editor initialization failed");
          return;
        }

        /* ---------- Yjs setup ---------- */
        const doc = getYDoc(roomId, file.fileId);
        const ytext = doc.getText("content");

        const unbindText = bindMonacoToYText(model, ytext);

        /* ---------- Yjs Transport ---------- */
        const unbindTransport = bindYjsToSocket(doc, roomId, file.fileId);

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
        let cursorRenderInterval: NodeJS.Timeout | null = null;
        let awarenessChangeTimeout: NodeJS.Timeout | null = null;
        
        const renderCursors = () => {
          if (!isMounted) return;
          try {
            renderRemoteCursors(editor, awareness);
          } catch (err) {
            console.error("Cursor render error:", err);
          }
        };

        // Start interval-based rendering
        cursorRenderInterval = setInterval(renderCursors, 100);

        // Also render on awareness change (throttled)
        const onAwarenessChange = () => {
          if (awarenessChangeTimeout) return;
          
          awarenessChangeTimeout = setTimeout(() => {
            renderCursors();
            awarenessChangeTimeout = null;
          }, 50);
        };

        awareness.on("change", onAwarenessChange);

        // Update cursor position on change
        const cursorDisposable = editor.onDidChangeCursorPosition(() => {
          if (!isMounted) return;
          
          try {
            const selection = editor.getSelection();
            if (!selection) return;

            awareness.setLocalStateField("cursor", {
              start: selection.getStartPosition(),
              end: selection.getEndPosition(),
            });
          } catch (err) {
            console.error("Cursor update error:", err);
          }
        });

        /* ---------- Create cleanup function ---------- */
        cleanup = () => {
          isMounted = false;
          
          if (cursorRenderInterval) {
            clearInterval(cursorRenderInterval);
            cursorRenderInterval = null;
          }
          
          if (awarenessChangeTimeout) {
            clearTimeout(awarenessChangeTimeout);
            awarenessChangeTimeout = null;
          }
          
          try {
            cursorDisposable.dispose();
          } catch {}
          
          try {
            awareness.off("change", onAwarenessChange);
            awareness.destroy();
          } catch {}
          
          try {
            unbindTransport();
          } catch {}
          
          try {
            unbindText();
          } catch {}
        };

        // Store cleanup for this file
        modelData.cleanup = cleanup;

      } catch (err) {
        console.error("Collaboration setup error:", err);
        if (isMounted) {
          setError("Failed to setup collaboration");
        }
      }
    };

    // Run setup
    setupCollaboration();

    // Cleanup on unmount or file change
    return () => {
      isMounted = false;
      if (cleanup) {
        try {
          cleanup();
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      }
    };
  }, [roomId, file?.fileId, file?.language, currentUser?.userId]);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Open a file to start coding
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        theme="vs-dark"
        language={file.language}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          // Disable features that can cause conflicts
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnCommitCharacter: false,
          tabCompletion: "off",
          wordBasedSuggestions: "off",
          // Prevent rendering issues
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "off",
        }}
      />
    </div>
  );
}