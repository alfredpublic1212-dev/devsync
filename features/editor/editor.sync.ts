import { sendFileUpdate } from "@/features/collaboration/sync.service";
import { useEditorStore } from "./editor.store";

export function syncEditorChange(
  fileId: string,
  content: string,
  version: number
) {
  // 1. Update local editor state
  useEditorStore
    .getState()
    .updateContent(fileId, content, version);

  // 2. Broadcast to other users
  sendFileUpdate({
    file: fileId,
    content,
    version,
  });
}
