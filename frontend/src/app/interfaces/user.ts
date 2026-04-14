export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface User {
  username: string;
  role: 'admin' | 'employee';
}