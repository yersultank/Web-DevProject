import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Asset, Category } from '../models/asset.model';
import { AuthResponse, LoginCredentials } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // ── Auth ──────────────────────────────────────────────────────────────────

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/token/`, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        if (res.refresh) localStorage.setItem('refresh_token', res.refresh);
      })
    );
  }

  register(credentials: LoginCredentials): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/`, credentials);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    // Не ставим Content-Type вручную — браузер сам добавит boundary для FormData
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Asset CRUD ────────────────────────────────────────────────────────────

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.apiUrl}/assets/`, { headers: this.authHeaders() });
  }

  // FormData — для поддержки загрузки изображений
  createAsset(data: FormData): Observable<Asset> {
    return this.http.post<Asset>(`${this.apiUrl}/assets/`, data, { headers: this.authHeaders() });
  }

  updateAsset(id: number, data: FormData): Observable<Asset> {
    return this.http.put<Asset>(`${this.apiUrl}/assets/${id}/`, data, { headers: this.authHeaders() });
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assets/${id}/`, { headers: this.authHeaders() });
  }

  // ── Categories ────────────────────────────────────────────────────────────

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`, { headers: this.authHeaders() });
  }
}