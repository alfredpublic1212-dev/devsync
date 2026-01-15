"use client";

import { useEffect } from "react";
import { getSocket } from "@/features/collaboration/socket.client";
import { useFSStore } from "./fs.store";
import type { FSNode } from "./fs.types";

export function useFilesystemSocket(roomId: string) {
  useEffect(() => {
    const socket = getSocket();
    const store = useFSStore.getState();

    socket.on("fs:snapshot", (tree: FSNode[]) => {
      store.setTree(tree);
    });

    socket.on("fs:create", (node: FSNode) => {
      store.addNode(node);
    });

    socket.on("fs:rename", ({ id, name }) => {
      store.renameNode(id, name);
    });

    socket.on("fs:delete", ({ id }) => {
      store.removeNode(id);
    });

    return () => {
      socket.off("fs:snapshot");
      socket.off("fs:create");
      socket.off("fs:rename");
      socket.off("fs:delete");
    };
  }, [roomId]);
}
