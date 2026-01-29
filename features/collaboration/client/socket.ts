// features/collaboration/client/socket.ts

import { io, Socket } from "socket.io-client";

/**
 * We store the socket on `globalThis` to survive
 * Next.js Fast Refresh / HMR without duplicating connections.
 */
declare global {
  // eslint-disable-next-line no-var
  var __devsyncSocket: Socket | undefined;
}

let socket: Socket | null = null;

/**
 * Create or return the singleton socket instance
 */
export function getSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("Socket can only be used in the browser");
  }

  if (!socket) {
    socket =
      globalThis.__devsyncSocket ??
      io(process.env.NEXT_PUBLIC_WS_URL!, {
        transports: ["websocket"],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        timeout: 10000,

        /**
         * Auth is transport-level metadata.
         * You can extend this later (JWT, session, etc).
         */
        auth: {
          client: "web",
        },
      });

    globalThis.__devsyncSocket = socket;

    /* ---------- Debug (optional but useful) ---------- */
    socket.on("connect", () => {
      console.log("🟢 Socket connected", socket!.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔴 Socket disconnected:", reason);
    });

    socket.on("reconnect", (attempt) => {
      console.log("🔁 Socket reconnected after", attempt);
      /**
       * IMPORTANT:
       * Room rejoin is handled by `connection.ts`
       * via `connect()` → `room:join`
       */
    });
  }

  return socket;
}

/**
 * Ephemeral client instance ID
 * Used ONLY for awareness/cursors
 * (never for auth, never persisted)
 */
export const CLIENT_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
