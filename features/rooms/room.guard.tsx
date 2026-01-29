import { useRoomStore } from "./room.store";

export function RoomGuard({ children }: { children: React.ReactNode }) {
  const isReady = useRoomStore((s) => s.isReady);

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        Loading room…
      </div>
    );
  }

  return <>{children}</>;
}
