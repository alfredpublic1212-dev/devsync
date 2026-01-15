import { sendFileUpdate } from "@/features/collaboration/sync.service";
import { useEditorStore } from "./editor.store";
import { CLIENT_ID } from "@/features/collaboration/socket.client";

export function syncEditorChange(
  roomId: string,
  fileId: string,
  content: string,
  version: number
) {
  // Optimistic local update
  useEditorStore
    .getState()
    .updateContent(fileId, content, version);

  sendFileUpdate({
    roomId,
    fileId,
    content,
    version,
    clientId: CLIENT_ID,
  });
}
