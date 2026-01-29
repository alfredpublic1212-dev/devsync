import { getSocket } from "../client/socket";

interface CreateNodeInput {
  roomId: string;
  parentId: string | null;
  name: string;
  type: "file" | "folder";
}

export function createNode(input: CreateNodeInput) {
  getSocket().emit("fs:create", input);
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
