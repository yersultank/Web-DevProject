export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}