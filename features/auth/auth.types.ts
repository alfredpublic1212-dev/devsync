export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
