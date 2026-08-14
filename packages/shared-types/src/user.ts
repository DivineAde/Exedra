export interface UserDTO {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthSession {
  user: UserDTO;
  token: string;
  expiresAt: string;
}
