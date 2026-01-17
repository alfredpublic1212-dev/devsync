/* ===============================
   FILE: features/collaboration/collaboration.provider.tsx
=============================== */

"use client";

import { useEffect } from "react";

import { connect, disconnect } from "./client/connection";

import { registerPresenceHandlers } from "./presence/presence.handlers";
import { registerFSHandlers } from "./filesystem/fs.handlers";
import { registerEditorHandlers } from "./editor/editor.handlers";

interface CollaborationProviderProps {
  roomId: string;
  userId: string;
  children: React.ReactNode;
}

/**
 * Authoritative collaboration lifecycle owner.
 *
 * - One socket
 * - One room
 * - One set of handlers
 * - Clean teardown
 */
export default function CollaborationProvider({
  roomId,
  userId,
  children,
}: CollaborationProviderProps) {
  useEffect(() => {
    /* ---------- Connect & join room ---------- */
    connect(roomId, userId);

    /* ---------- Register feature handlers ---------- */
    const unregisterPresence = registerPresenceHandlers(roomId);
    const unregisterFS = registerFSHandlers(roomId);
    const unregisterEditor = registerEditorHandlers(roomId);

    /* ---------- Cleanup ---------- */
    return () => {
      unregisterPresence?.();
      unregisterFS?.();
      unregisterEditor?.();

      disconnect(roomId);
    };
  }, [roomId, userId]);

  return <>{children}</>;
}
