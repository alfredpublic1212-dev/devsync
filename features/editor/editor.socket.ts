"use client";

import { useEffect } from "react";
import { getSocket, CLIENT_ID } from "@/features/collaboration/socket.client";
import { useEditorStore } from "./editor.store";

export function useEditorSocket(roomId: string) {
  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const onRemoteUpdate = ({
      fileId,
      content,
      version,
      clientId,
    }: {
      fileId: string;
      content: string;
      version: number;
      clientId: string;
    }) => {
      // 🛑 Ignore our own updates
      if (clientId === CLIENT_ID) return;

      const current =
        useEditorStore.getState().files.find(
          (f) => f.fileId === fileId
        );

      // 🛑 Ignore stale updates
      if (current && version <= current.version) return;

      useEditorStore
        .getState()
        .updateContent(fileId, content, version);
    };

    socket.on("file:update", onRemoteUpdate);

    return () => {
      socket.off("file:update", onRemoteUpdate);
    };
  }, [roomId]);
}
