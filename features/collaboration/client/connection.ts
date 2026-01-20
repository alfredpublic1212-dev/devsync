// features/collaboration/client/connection.ts

import { getSocket } from "./socket";
import { eventBus } from "./event-bus";

let activeRoomId: string | null = null;
let isConnecting = false;

export function connect(roomId: string, userId: string) {
  if (isConnecting) {
    console.log("Connection already in progress");
    return;
  }

  isConnecting = true;
  const socket = getSocket();

  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }

  activeRoomId = roomId;

  /* ---------- Setup event handlers (once) ---------- */
  
  // Only set up handlers if not already set
  if (!socket.hasListeners("connect")) {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (activeRoomId) {
        socket.emit("room:join", { roomId: activeRoomId, userId });
      }
    });
  }

  if (!socket.hasListeners("disconnect")) {
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      isConnecting = false;
    });
  }

  if (!socket.hasListeners("connect_error")) {
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      isConnecting = false;
    });
  }

  // File system events
  if (!socket.hasListeners("fs:snapshot")) {
    socket.on("fs:snapshot", (p) => {
      console.log("Received fs:snapshot", p);
      eventBus.emit("fs:snapshot", p);
    });
  }

  if (!socket.hasListeners("fs:create")) {
    socket.on("fs:create", (p) => {
      console.log("Received fs:create", p);
      eventBus.emit("fs:create", p);
    });
  }

  if (!socket.hasListeners("fs:rename")) {
    socket.on("fs:rename", (p) => {
      console.log("Received fs:rename", p);
      eventBus.emit("fs:rename", p);
    });
  }

  if (!socket.hasListeners("fs:delete")) {
    socket.on("fs:delete", (p) => {
      console.log("Received fs:delete", p);
      eventBus.emit("fs:delete", p);
    });
  }

  // Presence events
  if (!socket.hasListeners("presence:update")) {
    socket.on("presence:update", (p) => {
      console.log("Received presence:update", p);
      eventBus.emit("presence:update", p);
    });
  }

  if (!socket.hasListeners("presence:join")) {
    socket.on("presence:join", (p) => {
      console.log("Received presence:join", p);
      eventBus.emit("presence:join", p);
    });
  }

  if (!socket.hasListeners("presence:leave")) {
    socket.on("presence:leave", (p) => {
      console.log("Received presence:leave", p);
      eventBus.emit("presence:leave", p);
    });
  }

  /* ---------- Join room if already connected ---------- */
  if (socket.connected) {
    socket.emit("room:join", { roomId, userId });
  }

  isConnecting = false;
  eventBus.emit("room:joined", { roomId });
}

export function disconnect(roomId: string) {
  const socket = getSocket();

  if (socket.connected && activeRoomId === roomId) {
    socket.emit("room:leave", { roomId });
  }

  activeRoomId = null;
  eventBus.emit("room:left", { roomId });
  
  // Don't clear event bus or disconnect socket completely
  // as we might reconnect to another room
}

export function isConnected(): boolean {
  return getSocket().connected;
}

export function getActiveRoomId(): string | null {
  return activeRoomId;
}