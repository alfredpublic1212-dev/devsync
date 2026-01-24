import { Room, RoomMember } from "./room.types";

const rooms = new Map<string, Room>();

export function createRoom(room: Room) {
  rooms.set(room.id, room);
  return room;
}

export function getRoom(roomId: string) {
  return rooms.get(roomId) ?? null;
}

export function addMember(roomId: string, member: RoomMember) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const exists = room.members.some(m => m.userId === member.userId);
  if (!exists) room.members.push(member);

  return room;
}

export function removeMember(roomId: string, userId: string) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.members = room.members.filter(m => m.userId !== userId);
  return room;
}
