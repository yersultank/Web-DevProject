import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '../interfaces/user';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // URL вашего Django

  constructor(private http: HttpClient) {}

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/token/`, credentials)
      .pipe(
        tap(res => {
          localStorage.setItem('access_token', res.access);
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}