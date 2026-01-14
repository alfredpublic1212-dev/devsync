import { cookies } from "next/headers";
import type { AuthUser } from "./auth.types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get("devsync_token")?.value;

  if (!token) return null;

  // Later: verify JWT against Cognito
  return {
    id: "dev_user_1",
    email: "developer@devsync.local",
    name: "DevSync Developer",
  };
}
