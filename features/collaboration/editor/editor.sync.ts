/* ===============================
   FILE: features/collaboration/editor/editor.sync.ts
=============================== */

import { getSocket, CLIENT_ID } from "../client/socket";
import { useEditorStore } from "./editor.store";

export function sendEditorUpdate(
  roomId: string,
  fileId: string,
  content: string
) {
  const current =
    useEditorStore.getState().contents[fileId];

  getSocket().emit("file:update", {
    roomId,
    fileId,
    content,
    baseRevision: current?.revision ?? 0,
    clientId: CLIENT_ID,
  });
}
