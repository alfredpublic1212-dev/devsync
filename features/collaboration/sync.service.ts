import { getSocket } from "./socket.client";
import type { CursorPosition, FileUpdate } from "./collaboration.types";

export function sendCursor(cursor: CursorPosition) {
  const socket = getSocket();
  if (!socket.connected) return;
  socket.emit("cursor:update", cursor);
}

export function sendFileUpdate(update: FileUpdate) {
  const socket = getSocket();
  if (!socket.connected) return;
  socket.emit("file:update", update);
}
