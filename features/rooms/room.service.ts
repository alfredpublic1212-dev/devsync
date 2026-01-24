/* ===============================
   FILE: features/rooms/room.service.ts
=============================== */

import type { Room } from "./room.types";
import { getRoom } from "./room.store";

/**
 * Load a room by ID.
 *
 * Source of truth:
 * - In-memory room store (Map)
 *
 * Returns:
 * - Room if found
 * - null if not found
 */
export async function getRoomById(
  roomId: string
): Promise<Room | null> {
  if (!roomId || roomId.length < 6) {
    return null;
  }

  // In-memory lookup
  const room = getRoom(roomId);

  if (!room) {
    return null;
  }

  return room;
}
