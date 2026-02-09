import type { FSNode } from "@/features/collaboration/filesystem/fs.types";

export interface Room {
  id: string;
  name: string;
  ownerId: string;
}

export interface RoomMember {
  userId: string;
  role: "owner" | "editor" | "viewer";
}

export interface RoomJoinRequest {
  roomId: string;
  userId: string;
  name: string;
  email?: string;
  requestedAt: number;
}

export interface RoomSnapshot {
  roomId: string;
  room: Room;
  members: RoomMember[];
  tree: FSNode[];
}
