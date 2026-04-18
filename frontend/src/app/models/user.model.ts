/**
 * Request payload for login endpoint.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Basic authenticated user shape used in the frontend role checks.
 */
export interface User {
  username: string;
  role: 'admin' | 'employee';
}

/**
 * Optional profile metadata returned by token response serializer.
 */
export interface AuthUser {
  id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
}

/**
 * JWT response payload returned by backend authentication.
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user?: AuthUser;
}