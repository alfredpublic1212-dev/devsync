export type RoomRole = "owner" | "editor" | "viewer";

export interface RoomMember {
  userId: string;
  role: RoomRole;
}

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
  members: RoomMember[];
}
