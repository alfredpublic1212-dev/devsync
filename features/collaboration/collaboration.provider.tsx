"use client";

import { useEffect } from "react";
import { connect, disconnect } from "./client/connection";
import { eventBus } from "./client/event-bus";

import { registerPresenceHandlers } from "./presence/presence.handlers";
import { registerFSHandlers } from "./filesystem/fs.handlers";

interface CollaborationProviderProps {
  roomId: string;
  userId: string;
  children: React.ReactNode;
}

/**
 * Authoritative collaboration lifecycle owner
 */
export default function CollaborationProvider({
  roomId,
  userId,
  children,
}: CollaborationProviderProps) {
  useEffect(() => {
    connect(roomId, userId);

    let unregisterPresence: (() => void) | null = null;
    let unregisterFS: (() => void) | null = null;

    const offSnapshot = eventBus.on("room:snapshot", (payload) => {
      if (payload.roomId !== roomId) return;

      unregisterPresence = registerPresenceHandlers(roomId);
      unregisterFS = registerFSHandlers(roomId);
    });

    return () => {
      offSnapshot();
      unregisterPresence?.();
      unregisterFS?.();
      disconnect(roomId);
    };
  }, [roomId, userId]);

  return <>{children}</>;
}
