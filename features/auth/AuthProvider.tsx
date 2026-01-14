"use client";

import { AuthProvider as OidcProvider } from "react-oidc-context";

const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY!,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  redirect_uri: process.env.NEXT_PUBLIC_APP_URL!,
  response_type: "code",
  scope: "openid email profile",
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
}
