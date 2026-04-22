import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Asset, Category } from '../models/asset.model';
import { AuthResponse, LoginCredentials } from '../models/user.model';
import { UserProfile, MyAsset } from '../models/user-profile.model';

export interface UserListItem {
  id: number;
  username: string;
  full_name: string;
}

export interface AssignPayload {
  asset: number;
  user: number;
  notes?: string;
}

export interface StatusLog {
  id: number;
  asset_id: number;
  asset_name: string;
  asset_sn: string;
  from_status: string;
  to_status: string;
  changed_at: string;
  assigned_to: string | null;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/token/`, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('is_staff', String(res.user.is_staff));
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.api}/register/`, userData);
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

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.api}/assets/`);
  }

  createAsset(data: FormData): Observable<Asset> {
    return this.http.post<Asset>(`${this.api}/assets/`, data);
  }

  updateAsset(id: number, data: FormData): Observable<Asset> {
    return this.http.patch<Asset>(`${this.api}/assets/${id}/`, data);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/assets/${id}/`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories/`);
  }

  assignAsset(payload: AssignPayload): Observable<any> {
    return this.http.post(`${this.api}/assign/`, payload);
  }

  returnAsset(assignmentId: number): Observable<any> {
    return this.http.post(`${this.api}/assignments/${assignmentId}/return/`, {});
  }

  getMyAssets(): Observable<MyAsset[]> {
    return this.http.get<MyAsset[]>(`${this.api}/my-assets/`);
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/profile/`);
  }

  updateMyProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.api}/profile/`, data);
  }

  getUserList(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(`${this.api}/users/`);
  }

  getHistory(assetId?: number): Observable<StatusLog[]> {
    const params = assetId ? `?asset=${assetId}` : '';
    return this.http.get<StatusLog[]>(`${this.api}/history/${params}`);
  }

  getMyHistory(): Observable<StatusLog[]> {
    return this.http.get<StatusLog[]>(`${this.api}/my-history/`);
  }
}
