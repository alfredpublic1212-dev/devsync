import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
    });
  }

  return socket;
}

/**
 * Ephemeral client instance ID
 * Used ONLY for awareness/cursors
 */
export const CLIENT_ID =
  typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
