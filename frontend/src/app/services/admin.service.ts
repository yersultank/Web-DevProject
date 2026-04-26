import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentDetail, DashboardData, ToxicSettings, ToxicMessage } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.api}/dashboard/`);
  }

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.api}/students/`);
  }

  getStudent(id: number): Observable<StudentDetail> {
    return this.http.get<StudentDetail>(`${this.api}/students/${id}/`);
  }

  createStudent(data: { username: string; password: string; full_name?: string }): Observable<any> {
    return this.http.post(`${this.api}/students/`, data);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.api}/students/${id}/?confirm=true`);
  }

  getSettings(): Observable<ToxicSettings> {
    return this.http.get<ToxicSettings>(`${this.api}/settings/toxic/`);
  }

  updateSettings(data: Partial<ToxicSettings>): Observable<ToxicSettings> {
    return this.http.patch<ToxicSettings>(`${this.api}/settings/toxic/`, data);
  }

  addToxicMessage(data: { trigger: string; text: string }): Observable<ToxicMessage> {
    return this.http.post<ToxicMessage>(`${this.api}/settings/toxic/messages/`, data);
  }

  updateToxicMessage(id: number, data: Partial<ToxicMessage>): Observable<ToxicMessage> {
    return this.http.patch<ToxicMessage>(`${this.api}/settings/toxic/messages/${id}/`, data);
  }

  deleteToxicMessage(id: number): Observable<any> {
    return this.http.delete(`${this.api}/settings/toxic/messages/${id}/`);
  }
}
