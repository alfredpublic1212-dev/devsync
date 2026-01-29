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
 * Guarantees:
 * - Snapshot is never missed
 * - StrictMode safe
 * - Handlers registered exactly once
 */
export default function CollaborationProvider({
  roomId,
  userId,
  children,
}: CollaborationProviderProps) {
  const joinedRef = useRef(false);
  const handlersRegisteredRef = useRef(false);

  // ✅ IMPORTANT: subscribe FIRST
  useRoomSnapshot(roomId);

  useEffect(() => {
    connect(roomId, userId);
    joinedRef.current = true;

    let unregisterPresence: (() => void) | null = null;
    let unregisterFS: (() => void) | null = null;

    const offSnapshot = eventBus.on("room:snapshot", (payload) => {
      if (payload.roomId !== roomId) return;
      if (handlersRegisteredRef.current) return;

      handlersRegisteredRef.current = true;

      unregisterPresence = registerPresenceHandlers(roomId);
      unregisterFS = registerFSHandlers(roomId);
    });

    return () => {
      offSnapshot();

      if (handlersRegisteredRef.current) {
        unregisterPresence?.();
        unregisterFS?.();
        handlersRegisteredRef.current = false;
      }

      // ✅ StrictMode-safe disconnect
      if (joinedRef.current) {
        disconnect(roomId);
        joinedRef.current = false;
      }
    };
  }, [roomId, userId]);

  return <>{children}</>;
}
