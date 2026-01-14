// app/room/[roomId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/auth.service";
import { getRoomById } from "@/features/rooms/room.service";
import RoomProvider from "@/features/rooms/RoomProvider";
import RoomShellClient from "@/features/rooms/RoomShellClient";

interface RoomPageProps {
  readonly params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } =  await params;

  const room = await getRoomById(roomId);
  if (!room) notFound();

  // 1. Validate ID format
  // if (!roomId || roomId.length < 10) {
  //   notFound();
  // }

  // 2. Get authenticated user
  // const user = await getCurrentUser();
  // if (!user) {
  //   redirect("/");
  // }

  // 3. Load room metadata
  // const room = await getRoomById(roomId);
  // if (!room) {
  //   notFound();
  // }

  // 4. Security: check access
// if (!room.members.includes(user.id)) {
//   redirect("/dashboard");
// }

  // 5. Render ONLY the shell
  return (
     <RoomProvider room={room}>
    <RoomShellClient
      roomId={room.id}
      // userId={user.id}
      projectName={room.name}
    />
  </RoomProvider>
  );
}
