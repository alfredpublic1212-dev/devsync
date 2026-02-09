import { getSocket } from "@/features/collaboration/client/socket";

function toError(
  raw: unknown,
  fallback = "Room creation failed"
): Error {
  if (raw instanceof Error) return raw;
  if (typeof raw === "string" && raw.trim()) {
    return new Error(raw);
  }
  if (raw && typeof raw === "object") {
    const maybeMessage =
      "message" in raw && typeof raw.message === "string"
        ? raw.message
        : "error" in raw && typeof raw.error === "string"
        ? raw.error
        : "";
    if (maybeMessage.trim()) {
      return new Error(maybeMessage);
    }
  }
  return new Error(fallback);
}

export function createRoom(
  name: string,
  userId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    let settled = false;

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const onCreated = (payload: { roomId?: string } = {}) => {
      const roomId = payload.roomId;
      if (!roomId) {
        settle(() =>
          reject(new Error("Room created event missing roomId"))
        );
        return;
      }

      settle(() => resolve(roomId));
    };

    const onRoomError = (err: unknown) => {
      settle(() => reject(toError(err)));
    };

    const onConnectError = (err: unknown) => {
      settle(() =>
        reject(toError(err, "Unable to connect to realtime server"))
      );
    };

    const emitCreate = () => {
      socket.emit("room:create", { name, userId });
    };

    const timeoutId = setTimeout(() => {
      settle(() =>
        reject(new Error("Timed out while creating room"))
      );
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      socket.off("room:created", onCreated);
      socket.off("room:error", onRoomError);
      socket.off("connect_error", onConnectError);
      socket.off("connect", emitCreate);
    };

    socket.on("room:created", onCreated);
    socket.on("room:error", onRoomError);
    socket.on("connect_error", onConnectError);

    if (socket.connected) {
      emitCreate();
    } else {
      socket.on("connect", emitCreate);
      socket.connect();
    }
  });
}


export function joinRoom(roomId: string, userId: string) {
  const socket = getSocket();
  socket.emit("room:join", { roomId, userId });
}

export function assignRoomMemberRole(input: {
  roomId: string;
  userId: string;
  role: "editor" | "viewer";
}) {
  const socket = getSocket();
  socket.emit("room:assign-role", input);
}
