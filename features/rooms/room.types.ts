export interface Room {
id: string;
name: string;
ownerId: string;
}


export interface RoomMember {
userId: string;
role: "owner" | "editor" | "viewer";
}


export interface RoomSnapshot {
roomId: string;
tree: any[]; // FSNode[] comes from filesystem feature
}