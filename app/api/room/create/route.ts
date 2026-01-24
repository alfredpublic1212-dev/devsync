import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

import { createRoom } from "@/features/rooms/room.store";
import { getServerAuth } from "@/features/auth/getServerAuth";

export async function POST(req: Request) {
  const session = await getServerAuth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Room name required" },
      { status: 400 }
    );
  }

  const roomId = uuidv4();

  // 1️⃣ Create room in memory
  createRoom({
    id: roomId,
    name,
    ownerId: session.user.id,
    createdAt: new Date().toISOString(),
    members: [],
  });

  (await
    // 2️⃣ Set signed HTTP-only cookie
    cookies()).set({
    name: `room:${roomId}`,
    value: JSON.stringify({ name }),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ roomId });
}
