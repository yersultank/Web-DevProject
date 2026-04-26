import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Announcement } from '../models/announcement.model';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.api}/announcements/`);
  }

  createAnnouncement(data: FormData): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.api}/announcements/`, data);
  }

  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${this.api}/announcements/${id}/?confirm=true`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/announcements/unread-count/`);
  }
}
