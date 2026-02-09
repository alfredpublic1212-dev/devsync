import type { Session } from "next-auth";
import type { RoomMember } from "./room.types";
import type { PresenceUser } from "@/features/collaboration/presence/presence.types";

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function getIdentityCandidates(sessionUser: Session["user"] | undefined) {
  return [
    normalize(sessionUser?.id),
    normalize(sessionUser?.email),
    normalize(sessionUser?.name),
  ].filter(Boolean);
}

function matchesIdentity(
  value: string | null | undefined,
  candidates: string[]
): boolean {
  const normalized = normalize(value);
  return normalized.length > 0 && candidates.includes(normalized);
}

export function resolveMyRole(
  members: RoomMember[],
  sessionUser: Session["user"] | undefined
): RoomMember["role"] {
  const candidates = getIdentityCandidates(sessionUser);
  if (candidates.length === 0) return "viewer";

  const matched = members.find((member) =>
    matchesIdentity(member.userId, candidates)
  );

  return matched?.role ?? "viewer";
}

export function findCurrentPresenceUser(
  users: Record<string, PresenceUser>,
  sessionUser: Session["user"] | undefined
): PresenceUser | null {
  const candidates = getIdentityCandidates(sessionUser);
  if (candidates.length === 0) return null;

  for (const user of Object.values(users)) {
    if (!user.online) continue;
    if (matchesIdentity(user.userId, candidates)) return user;
  }

  return null;
}
