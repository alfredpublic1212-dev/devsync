import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/auth.service";
import { getRoomById } from "@/features/rooms/room.service";

import RoomProvider from "@/features/rooms/RoomProvider";
import RoomShellClient from "@/features/rooms/RoomShellClient";
import CollaborationProvider from "@/features/collaboration/collaboration.provider";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({
  params,
}: RoomPageProps) {
  /* ---------- Async params (REQUIRED) ---------- */
  const { roomId } = await params;

  /* ---------- Validate param ---------- */
  if (!roomId || roomId.length < 6) {
    notFound();
  }

  /* ---------- Auth ---------- */
  const user = await getCurrentUser();
  if (!user) {
    redirect("/dashboard");
  }

  /* ---------- Load room ---------- */
  const room = await getRoomById(roomId);
  if (!room) {
    notFound();
  }

  /* ---------- Access control ---------- */
  const isMember = room.members.some(
    (m) => m.userId === user.id
  );

  if (!isMember) {
    redirect("/dashboard");
  }

  /* ---------- Render ---------- */
  return (
    <RoomProvider room={room}>
      <CollaborationProvider
        roomId={room.id}
        userId={user.id}
      >
        <RoomShellClient
          roomId={room.id}
          projectName={room.name}
        />
      </CollaborationProvider>
    </RoomProvider>
  );
}
