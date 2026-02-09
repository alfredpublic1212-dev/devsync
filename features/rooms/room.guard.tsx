"use client";

import { useRoomStore } from "./room.store";

export function RoomGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const isReady = useRoomStore((s) => s.isReady);
  const error = useRoomStore((s) => s.error);
  const isAwaitingRoleAssignment = useRoomStore(
    (s) => s.isAwaitingRoleAssignment
  );
  const awaitingRoleMessage = useRoomStore((s) => s.awaitingRoleMessage);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (isAwaitingRoleAssignment) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-400">
        <p className="text-sm">Waiting for role assignment…</p>
        <p className="text-xs text-neutral-500">
          {awaitingRoleMessage ?? "The room owner needs to assign your role."}
        </p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Loading room…
      </div>
    );
  }

  return <>{children}</>;
}
