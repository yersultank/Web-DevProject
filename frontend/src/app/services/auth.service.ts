import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Asset } from '../models/asset.model';
import { AuthResponse, LoginCredentials } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
/**
 * Centralizes frontend authentication and protected API requests.
 */
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Authenticates a user and stores the access token.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/token/`, credentials)
      .pipe(
        tap(res => {
          localStorage.setItem('access_token', res.access);
        })
      );
  }

  /**
   * Fetches the admin asset list.
   */
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.apiUrl}/assets/`);
  }

  /**
   * Clears the local token to sign out the active user.
   */
  logout(): void {
    localStorage.removeItem('access_token');
  }

  /**
   * Returns true when an access token exists in localStorage.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}