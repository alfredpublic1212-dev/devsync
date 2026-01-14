"use client";

import { useAuth as useOidc } from "react-oidc-context";
import type { AuthUser } from "./auth.types";

export function useAuth() {
  const auth = useOidc();

  const user: AuthUser | null = auth.user
    ? {
        id: auth.user.profile.sub,
        email: auth.user.profile.email!,
        name: auth.user.profile.name,
      }
    : null;

  return {
    user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    login: () => auth.signinRedirect(),
    logout: () => auth.removeUser(),
  };
}
