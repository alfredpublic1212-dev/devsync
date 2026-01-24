export type RoomRole = "owner" | "editor" | "viewer";

export interface RoomMember {
  userId: string;
  name?: string;
  role: RoomRole;
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  members: RoomMember[];
  createdAt: string;
}
