import { redirect } from "next/navigation";
import { getServerAuth } from "@/features/auth/getServerAuth";

import CollaborationProvider from "@/features/collaboration/collaboration.provider";
import RoomShellClient from "@/features/rooms/RoomShellClient";
import { RoomGuard } from "@/features/rooms/room.guard";

async function fetchRoom(roomId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WS_URL}/api/rooms/${roomId}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  if (!roomId) redirect("/dashboard");

  const session = await getServerAuth();
  if (!session?.user?.id) redirect("/auth");

  const room = await fetchRoom(roomId);
  if (!room) redirect("/dashboard");

  return (
    <CollaborationProvider roomId={roomId} userId={session.user.id}>
      <RoomGuard>
        <RoomShellClient
          roomId={roomId}
          initialRoom={{
            id: room.id,
            name: room.name,
            ownerId: room.ownerId,
          }}
        />
      </RoomGuard>
    </CollaborationProvider>
  );
}
