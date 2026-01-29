import { getSocket } from "@/features/collaboration/client/socket";

export function createRoom(
  name: string,
  userId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("room:create", { name, userId });

    socket.once("room:created", ({ roomId }) => {
      resolve(roomId);
    });

    socket.once("room:error", (err) => {
      reject(err);
    });
  });
}


export function joinRoom(roomId: string, userId: string) {
  const socket = getSocket();
  socket.emit("room:join", { roomId, userId });
}
