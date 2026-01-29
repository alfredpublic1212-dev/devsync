import { getSocket } from "@/features/collaboration/client/socket";


export function createRoom(name: string, userId: string) {
return new Promise<string>((resolve, reject) => {
const socket = getSocket();


socket.emit("room:create", { name, userId });


socket.once("room:created", ({ roomId }) => {
resolve(roomId);
});


socket.once("room:error", reject);
});
}


export function joinRoom(roomId: string, userId: string) {
const socket = getSocket();
socket.emit("room:join", { roomId, userId });
}