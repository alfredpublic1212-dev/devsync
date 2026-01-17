/* ===============================
   FILE: features/collaboration/presence/presence.types.ts
=============================== */

export interface PresenceUser {
  userId: string;
  name: string;
  color: string;
  online: boolean;
  lastSeen: number;
}

export interface PresenceSnapshot {
  roomId: string;
  users: PresenceUser[];
}
