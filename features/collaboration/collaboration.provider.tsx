"use client";

import { useEffect, useRef } from "react";
import { connect, disconnect } from "./client/connection";
import { eventBus } from "./client/event-bus";

import { registerPresenceHandlers } from "./presence/presence.handlers";
import { registerFSHandlers } from "./filesystem/fs.handlers";
import { useRoomSnapshot } from "../rooms/room.hooks";

interface CollaborationProviderProps {
  roomId: string;
  userId: string;
  children: React.ReactNode;
}

/**
 * Authoritative collaboration lifecycle owner
 *
 * IMPORTANT:
 * - Avoid disconnect during initial StrictMode unmount
 */
export default function CollaborationProvider({
  roomId,
  userId,
  children,
}: CollaborationProviderProps) {
  const joinedRef = useRef(false);

  useEffect(() => {
    connect(roomId, userId);
    joinedRef.current = true;

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

      // ONLY disconnect if we actually joined
      if (joinedRef.current) {
        disconnect(roomId);
        joinedRef.current = false;
      }
    };
  }, [roomId, userId]);

  useRoomSnapshot(roomId);

  return <>{children}</>;
}
