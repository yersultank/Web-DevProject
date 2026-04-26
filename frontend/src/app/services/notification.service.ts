import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.api}/notifications/`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/notifications/unread-count/`);
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.api}/notifications/read-all/`, {});
  }

  triggerToxic(trigger: 'tab_leave' | 'late_submit'): Observable<any> {
    return this.http.post(`${this.api}/notifications/`, { trigger });
  }
}
