import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { ChatMessage } from '../../../models/chat.model';

@Component({
  selector: 'app-student-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-chat.component.html',
  styleUrl: './student-chat.component.css'
})
export class StudentChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  text = '';
  userId = 0;
  adminId = 0;
  private ws: WebSocket | null = null;
  @ViewChild('msgEnd') msgEnd!: ElementRef;

  constructor(private chatService: ChatService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.chatService.getChat().subscribe({
      next: (msgs: any) => {
        this.messages = msgs;
        this.scrollToBottom();
        if (msgs.length) {
          const other = msgs.find((m: ChatMessage) => m.sender_id !== this.userId);
          if (other) this.adminId = other.sender_id;
        }
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    this.ws = this.chatService.connectChat(this.auth.getToken());
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message') {
        this.messages.push(data);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    };
  }

  send() {
    if (!this.text.trim() || !this.ws) return;
    if (this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ text: this.text, recipient_id: this.adminId || 1 }));
    this.text = '';
  }

  scrollToBottom() {
    try { this.msgEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  ngOnDestroy() { this.ws?.close(); }
}
