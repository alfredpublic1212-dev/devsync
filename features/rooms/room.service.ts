/* ===============================
   FILE: features/room/room.service.ts
=============================== */

import type { Room, RoomMember } from "./room.types";

const DEV_MODE =
  process.env.NODE_ENV !== "production";

/**
 * Load a room by ID.
 *
 * In DEV:
 * - missing rooms return a stub
 *
 * In PROD:
 * - missing rooms return null
 */
export async function getRoomById(
  roomId: string
): Promise<Room | null> {
  if (!roomId || roomId.length < 6) {
    return null;
  }

  // ─────────────────────────────────────────────
  // TODO: Replace with DB lookup
  // ─────────────────────────────────────────────
  const roomFromDb: Room | null = null;

  if (!roomFromDb) {
    if (!DEV_MODE) {
      return null;
    }

    /* ---------- DEV FALLBACK ---------- */
    const members: RoomMember[] = [
      {
        userId: "dev_user_1",
        name: "Dev Owner",
        role: "owner",
      },
      {
        userId: "dev_user_2",
        name: "Dev Editor",
        role: "editor",
      },
    ];

    return {
      id: roomId,
      name: "Dev Project",
      ownerId: "dev_user_1",
      createdAt: new Date().toISOString(),
      members,
    };
  }

  return roomFromDb;
}
