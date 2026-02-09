export interface PresenceUser {
  cursor: any;
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

export interface PresenceJoinPayload extends PresenceUser {}

export interface PresenceLeavePayload {
  userId: string;
}
