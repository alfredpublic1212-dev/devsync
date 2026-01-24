import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerAuth } from "@/features/auth/getServerAuth";
import { getRoomById } from "@/features/rooms/room.service";

import RoomProvider from "@/features/rooms/RoomProvider";
import CollaborationProvider from "@/features/collaboration/collaboration.provider";
import RoomShellClient from "@/features/rooms/RoomShellClient";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  if (!roomId) redirect("/dashboard");

  const session = await getServerAuth();
  if (!session?.user?.id) redirect("/");

  // 1️⃣ Try in-memory store
  const room = await getRoomById(roomId);

  // 2️⃣ Fallback to signed cookie
  const cookie = (await cookies()).get(`room:${roomId}`);
  const cookieMeta = cookie
    ? JSON.parse(cookie.value)
    : null;

  const safeRoom = room ?? {
    id: roomId,
    name: cookieMeta?.name ?? "Untitled Project",
    ownerId: session.user.id,
    createdAt: new Date().toISOString(),
    members: [],
  };

  return (
    <RoomProvider room={safeRoom}>
      <CollaborationProvider
        roomId={roomId}
        userId={session.user.id}
      >
        <RoomShellClient
          roomId={roomId}
          projectName={safeRoom.name}
        />
      </CollaborationProvider>
    </RoomProvider>
  );
}
