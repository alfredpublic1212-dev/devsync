// features/collaboration/client/connection.ts

import { getSocket } from "./socket";
import { eventBus } from "./event-bus";

let activeRoomId: string | null = null;
let isConnecting = false;
let hasSnapshot = false;

export function connect(roomId: string, userId: string) {
  if (isConnecting) return;

  isConnecting = true;
  hasSnapshot = false;

  const socket = getSocket();
  activeRoomId = roomId;

  if (!socket.connected) {
    socket.connect();
  }

  /* ---------- Connect ---------- */
  if (!socket.hasListeners("connect")) {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (activeRoomId) {
        socket.emit("room:join", {
          roomId: activeRoomId,
          userId,
        });
      }
    });
  }

  /* ---------- Room snapshot (CRITICAL) ---------- */
  if (!socket.hasListeners("room:snapshot")) {
    socket.on("room:snapshot", (payload) => {
      console.log("✅ Room snapshot received", payload);

      if (payload.roomId !== activeRoomId) return;

      hasSnapshot = true;

      // Emit snapshot FIRST
      eventBus.emit("room:snapshot", payload);

      // Only now mark room as joined
      eventBus.emit("room:joined", {
        roomId: payload.roomId,
      });
    });
  }

  /* ---------- Disconnect ---------- */
  if (!socket.hasListeners("disconnect")) {
    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      isConnecting = false;
      hasSnapshot = false;
    });
  }

  if (!socket.hasListeners("connect_error")) {
    socket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err);
      isConnecting = false;
      hasSnapshot = false;
    });
  }

  /* ---------- Filesystem ---------- */
  if (!socket.hasListeners("fs:snapshot")) {
    socket.on("fs:snapshot", (p) => {
      eventBus.emit("fs:snapshot", p);
    });
  }

  if (!socket.hasListeners("fs:create")) {
    socket.on("fs:create", (p) => {
      eventBus.emit("fs:create", p);
    });
  }

  if (!socket.hasListeners("fs:rename")) {
    socket.on("fs:rename", (p) => {
      eventBus.emit("fs:rename", p);
    });
  }

  if (!socket.hasListeners("fs:delete")) {
    socket.on("fs:delete", (p) => {
      eventBus.emit("fs:delete", p);
    });
  }

  /* ---------- Presence ---------- */
  if (!socket.hasListeners("presence:update")) {
    socket.on("presence:update", (p) => {
      eventBus.emit("presence:update", p);
    });
  }

  if (!socket.hasListeners("presence:join")) {
    socket.on("presence:join", (p) => {
      eventBus.emit("presence:join", p);
    });
  }

  if (!socket.hasListeners("presence:leave")) {
    socket.on("presence:leave", (p) => {
      eventBus.emit("presence:leave", p);
    });
  }

  /* ---------- If already connected ---------- */
  if (socket.connected) {
    socket.emit("room:join", { roomId, userId });
  }

  isConnecting = false;
}

export function disconnect(roomId: string) {
  const socket = getSocket();

  if (socket.connected && activeRoomId === roomId) {
    socket.emit("room:leave", { roomId });
  }

  activeRoomId = null;
  hasSnapshot = false;

  eventBus.emit("room:left", { roomId });
}

export function hasRoomSnapshot(): boolean {
  return hasSnapshot;
}

export function isConnected(): boolean {
  return getSocket().connected;
}

export function getActiveRoomId(): string | null {
  return activeRoomId;
}
