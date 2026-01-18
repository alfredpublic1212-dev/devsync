import { getSocket } from "./socket";
import { eventBus } from "./event-bus";

let activeRoomId: string | null = null;

export function connect(roomId: string, userId: string) {
  const socket = getSocket();

  if (!socket.connected) {
    socket.connect();
  }

  activeRoomId = roomId;

  socket.on("connect", () => {
    socket.emit("room:join", { roomId, userId });
  });

  socket.on("fs:snapshot", (p) => eventBus.emit("fs:snapshot", p));

  socket.on("fs:create", (p) => eventBus.emit("fs:create", p));

  socket.on("fs:rename", (p) => eventBus.emit("fs:rename", p));

  socket.on("fs:delete", (p) => eventBus.emit("fs:delete", p));

  socket.on("presence:update", (p) => eventBus.emit("presence:update", p));

  socket.on("presence:join", (p) => eventBus.emit("presence:join", p));

  socket.on("presence:leave", (p) => eventBus.emit("presence:leave", p));

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
