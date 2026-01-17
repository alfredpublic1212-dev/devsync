/* ===============================
   FILE: features/auth/auth.service.ts
=============================== */

import { cookies } from "next/headers";
import type { AuthUser } from "./auth.types";

/**
 * Server-only auth helper.
 *
 * NOTE:
 * In this Next.js version, `cookies()` is async.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("devsync_token")?.value;

  if (!token) {
    // ───────── DEV FALLBACK ─────────
    if (process.env.NODE_ENV !== "production") {
      return {
        id: "dev_user_1",
        email: "dev@devsync.local",
        name: "Dev User",
      };
    }

    return null;
  }

  // TODO: Verify JWT / Cognito token
  return {
    id: "dev_user_1",
    email: "dev@devsync.local",
    name: "Dev User",
  };
}
