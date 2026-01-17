/* ===============================
   FILE: features/collaboration/editor/editor.handlers.ts
=============================== */

import { eventBus } from "../client/event-bus";
import { useEditorStore } from "./editor.store";
import type { EditorContent } from "./editor.types";

/* ---------- Runtime validation ---------- */

function isEditorContent(p: any): p is EditorContent {
  return (
    p &&
    typeof p.fileId === "string" &&
    typeof p.content === "string" &&
    typeof p.revision === "number"
  );
}

/* ---------- Registration ---------- */

export function registerEditorHandlers(roomId: string) {
  const store = useEditorStore.getState();

  const offUpdate = eventBus.on(
    "file:update",
    (payload) => {
      if (!isEditorContent(payload)) return;
      store.applyRemoteUpdate(payload);
    }
  );

  const offLeave = eventBus.on("room:left", () => {
    store.clear();
  });

  return () => {
    offUpdate();
    offLeave();
  };
}
