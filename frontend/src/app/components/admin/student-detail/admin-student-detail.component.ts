import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { StudentDetail } from '../../../models/user.model';
import { ChatMessage } from '../../../models/chat.model';

@Component({
  selector: 'app-admin-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-student-detail.component.html',
  styleUrl: './admin-student-detail.component.css'
})
export class AdminStudentDetailComponent implements OnInit, OnDestroy {
  student: StudentDetail | null = null;
  messages: ChatMessage[] = [];
  chatText = '';
  private ws: WebSocket | null = null;
  adminId = 0;
  studentId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private chatService: ChatService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.adminId = this.auth.getUserId();
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.getStudent(this.studentId).subscribe({
      next: s => { this.student = s; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });

    this.chatService.getChat(this.studentId).subscribe({
      next: (msgs: any) => { this.messages = msgs; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });

    this.ws = this.chatService.connectChat(this.auth.getToken(), this.studentId);
    this.ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === 'message') this.messages.push(d);
    };
  }

  send() {
    if (!this.chatText.trim() || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ text: this.chatText, recipient_id: this.studentId }));
    this.chatText = '';
  }

  openSubmission(submissionId: number) {
    this.router.navigate(['/admin/review'], { queryParams: { id: submissionId } });
  }

  initials(name: string) { return (name || '?')[0].toUpperCase(); }

  ngOnDestroy() { this.ws?.close(); }
}
