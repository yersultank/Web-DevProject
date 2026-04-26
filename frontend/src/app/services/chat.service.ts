import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, ChatThread } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = 'http://127.0.0.1:8000/api';
  private wsBase = 'ws://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getChat(userId?: number): Observable<ChatMessage[] | ChatThread[]> {
    const url = userId ? `${this.api}/chat/${userId}/` : `${this.api}/chat/`;
    return this.http.get<ChatMessage[] | ChatThread[]>(url);
  }

  sendMessage(userId: number, text: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.api}/chat/${userId}/`, { text });
  }

  connectChat(token: string, otherId?: number): WebSocket {
    const params = otherId ? `?token=${token}&other_id=${otherId}` : `?token=${token}`;
    return new WebSocket(`${this.wsBase}/ws/chat/${params}`);
  }

  connectSubmissionChat(submissionId: number, token: string): WebSocket {
    return new WebSocket(`${this.wsBase}/ws/submission/${submissionId}/?token=${token}`);
  }
}
