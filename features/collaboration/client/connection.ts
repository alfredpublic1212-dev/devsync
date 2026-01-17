/* ===============================
   FILE: features/collaboration/client/connection.ts
=============================== */

import { getSocket } from "./socket";
import { eventBus } from "./event-bus";

let activeRoomId: string | null = null;

export function connect(roomId: string, userId: string) {
  const socket = getSocket();

  if (!socket.connected) {
    socket.connect();
  }

  activeRoomId = roomId;

  /* ---------- Core socket listeners ---------- */

  socket.on("connect", () => {
    if (activeRoomId) {
      socket.emit("room:join", {
        roomId: activeRoomId,
        userId,
      });
    }
  });

  socket.on("disconnect", () => {
    // intentional: do nothing
    // reconnect handled automatically
  });

  /* ---------- Forward all collaboration events ---------- */

  socket.on("fs:snapshot", (payload) =>
    eventBus.emit("fs:snapshot", payload)
  );

  socket.on("fs:create", (payload) =>
    eventBus.emit("fs:create", payload)
  );

  socket.on("fs:rename", (payload) =>
    eventBus.emit("fs:rename", payload)
  );

  socket.on("fs:delete", (payload) =>
    eventBus.emit("fs:delete", payload)
  );

  socket.on("file:update", (payload) =>
    eventBus.emit("file:update", payload)
  );

  socket.on("cursor:update", (payload) =>
    eventBus.emit("cursor:update", payload)
  );

  socket.on("presence:update", (payload) =>
    eventBus.emit("presence:update", payload)
  );

  /* ---------- Initial join ---------- */

  socket.emit("room:join", { roomId, userId });
  eventBus.emit("room:joined", { roomId });
}

export function disconnect(roomId: string) {
  const socket = getSocket();

  if (socket.connected) {
    socket.emit("room:leave", { roomId });
  }

  activeRoomId = null;

  eventBus.emit("room:left", { roomId });
  eventBus.clear();
}
