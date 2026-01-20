// features/collaboration/filesystem/fs.action.ts

import { getSocket } from "../client/socket";

interface CreateNodeInput {
  roomId: string;
  parentId?: string | null; // Made optional with null support
  name: string;
  type: "file" | "folder";
}

export function createNode(input: CreateNodeInput) {
  const socket = getSocket();
  
  // Ensure parentId is explicitly passed (null for root level)
  const payload = {
    ...input,
    parentId: input.parentId ?? null
  };
  
  socket.emit("fs:create", payload);
}

export function renameNode(input: {
  roomId: string;
  id: string;
  name: string;
}) {
  getSocket().emit("fs:rename", input);
}

export function deleteNode(input: {
  roomId: string;
  id: string;
}) {
  getSocket().emit("fs:delete", input);
}