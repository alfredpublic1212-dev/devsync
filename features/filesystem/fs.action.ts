import type { FSNode } from "./fs.types";
import { useFSStore } from "./fs.store";
import { getSocket } from "@/features/collaboration/socket.client";

export function useFSActions(roomId: string) {
  const { addNode, renameNode, removeNode } = useFSStore();

  function createFile(parent: FSNode, name: string) {
    const node: FSNode = {
      id: crypto.randomUUID(),
      name,
      type: "file",
      parentId: parent.id,
      path: parent.path ? `${parent.path}/${name}` : name,
    };

    addNode(node);
    getSocket().emit("fs:create", { roomId, node });
  }

  function createFolder(parent: FSNode, name: string) {
    const node: FSNode = {
      id: crypto.randomUUID(),
      name,
      type: "folder",
      parentId: parent.id,
      path: parent.path ? `${parent.path}/${name}` : name,
    };

    addNode(node);
    getSocket().emit("fs:create", { roomId, node });
  }

  function rename(node: FSNode, name: string) {
    renameNode(node.id, name);
    getSocket().emit("fs:rename", { roomId, id: node.id, name });
  }

  function remove(node: FSNode) {
    removeNode(node.id);
    getSocket().emit("fs:delete", { roomId, id: node.id });
  }

  return {
    createFile,
    createFolder,
    rename,
    remove,
  };
}
