import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginCredentials } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/token/`, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('user_id', String(res.user.id));
        localStorage.setItem('username', res.user.username);
        localStorage.setItem('is_staff', String(res.user.is_staff));
      })
    );
  }

  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${this.api}/logout/`, { refresh }).subscribe();
    }
    localStorage.clear();
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('access_token'); }
  isAdmin(): boolean { return localStorage.getItem('is_staff') === 'true'; }
  isStudent(): boolean { return this.isLoggedIn() && !this.isAdmin(); }
  getUserId(): number { return Number(localStorage.getItem('user_id')); }
  getUsername(): string { return localStorage.getItem('username') ?? ''; }
  getToken(): string { return localStorage.getItem('access_token') ?? ''; }

  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/profile/`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(`${this.api}/profile/`, data);
  }
}
