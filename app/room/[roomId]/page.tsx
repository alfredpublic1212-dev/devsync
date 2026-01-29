import { redirect } from "next/navigation";
import { getServerAuth } from "@/features/auth/getServerAuth";

import CollaborationProvider from "@/features/collaboration/collaboration.provider";
import RoomShellClient from "@/features/rooms/RoomShellClient";
import { RoomGuard } from "@/features/rooms/room.guard";

export default async function RoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = params;

  if (!roomId) redirect("/dashboard");

  const session = await getServerAuth();
  if (!session?.user?.id) redirect("/auth");

  return (
    <CollaborationProvider
      roomId={roomId}
      userId={session.user.id}
    >
      <RoomGuard>
        <RoomShellClient roomId={roomId} />
      </RoomGuard>
    </CollaborationProvider>
  );
}
