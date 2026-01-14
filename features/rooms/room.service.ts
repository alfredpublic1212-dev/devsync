import type { Room } from "./room.types";

/**
 * Loads a room and verifies it exists.
 * Later this will hit PostgreSQL / DynamoDB.
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  // TEMP: stub
  return {
    id: roomId,
    name: "DevSync",
    createdAt: new Date().toISOString(),
    ownerId: "dev_user_1",
    members: [
      { userId: "dev_user_1", role: "owner" },
      { userId: "dev_user_2", role: "editor" },
    ],
  };
}
