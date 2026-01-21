'use client';

import { AuthProvider } from 'react-oidc-context';

const oidcConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_QZ4kjF1Xq',
  client_id: '4cs8n063hjssf8s6tlj2qeogbc',
  redirect_uri: 'https://devsync-teal.vercel.app/',
  response_type: 'code',
  scope: 'openid email phone',
};

export default function OidcProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...oidcConfig}>{children}</AuthProvider>;
}
