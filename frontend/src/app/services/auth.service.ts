import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Asset, Category } from '../models/asset.model';
import { AuthResponse, LoginCredentials } from '../models/user.model';
import { UserProfile } from '../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // ── Auth 
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/token/`, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('is_staff', String(res.user.is_staff));
      })
    );
  }

  register(credentials: LoginCredentials): Observable<any> {
    return this.http.post(`${this.api}/register/`, credentials);
  }

  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${this.api}/logout/`, { refresh }).subscribe();
    }
    localStorage.clear();
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('access_token'); }
  isAdmin():    boolean { return localStorage.getItem('is_staff') === 'true'; }

  // ── Assets ────────────────────────────────────────────────────────────────

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.api}/assets/`);
  }

  createAsset(data: FormData): Observable<Asset> {
    return this.http.post<Asset>(`${this.api}/assets/`, data);
  }

  updateAsset(id: number, data: FormData): Observable<Asset> {
    return this.http.put<Asset>(`${this.api}/assets/${id}/`, data);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/assets/${id}/`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories/`);
  }

  // ── My Assets (for user)

  getMyAssets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/my-assets/`);
  }

  // ── Profile

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/profile/`);
  }

  updateMyProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.api}/profile/`, data);
  }
}