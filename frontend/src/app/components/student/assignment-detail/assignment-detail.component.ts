import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { NotificationService } from '../../../services/notification.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { MyAssignment, Submission, SubmissionComment } from '../../../models/assignment.model';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.css'
})
export class AssignmentDetailComponent implements OnInit, OnDestroy {
  assignment: MyAssignment | null = null;
  submission: Submission | null = null;
  loading = true;
  submitting = false;
  submitError = '';

  textAnswer = '';
  codeAnswer = '';
  codeOutput = '';
  selectedFile: File | null = null;

  chatMessages: SubmissionComment[] = [];
  chatText = '';
  private ws: WebSocket | null = null;
  private visibilityHandler!: () => void;

  userId = 0;

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private notifService: NotificationService,
    private chatService: ChatService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.userId = this.auth.getUserId();
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.assignmentService.getMyAssignments().subscribe({
      next: list => {
        this.assignment = list.find(a => a.id === id) ?? null;
        this.loading = false;
        if (this.assignment?.submission_id) {
          this.assignmentService.getSubmission(this.assignment.submission_id).subscribe(s => {
            this.submission = s;
            this.chatMessages = s.comments ?? [];
            this.connectWs(s.id);
            this.cdr.detectChanges();
          });
        }
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });

    // Anti-cheat: clear answers on tab leave
    this.visibilityHandler = () => {
      if (document.hidden) return;
      this.textAnswer = '';
      this.codeAnswer = '';
      this.notifService.triggerToxic('tab_leave').subscribe();
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  runCode() {
    try {
      const logs: string[] = [];
      const origLog = console.log;
      console.log = (...args) => logs.push(args.map(String).join(' '));
      // eslint-disable-next-line no-new-func
      new Function(this.codeAnswer)();
      console.log = origLog;
      this.codeOutput = logs.join('\n') || '(no output)';
    } catch (e: any) {
      this.codeOutput = 'Error: ' + e.message;
    }
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit() {
    if (!this.assignment) return;
    this.submitting = true;
    this.submitError = '';

    const fd = new FormData();
    fd.append('assignment_id', String(this.assignment.id));
    fd.append('text_answer', this.textAnswer);
    fd.append('code_answer', this.codeAnswer);
    if (this.selectedFile) fd.append('file_answer', this.selectedFile);

    this.assignmentService.submitAssignment(fd).subscribe({
      next: sub => {
        this.submission = sub;
        this.submitting = false;
        if (sub.is_late) {
          this.notifService.triggerToxic('late_submit').subscribe();
        }
        this.connectWs(sub.id);
        this.cdr.detectChanges();
      },
      error: err => {
        this.submitting = false;
        this.submitError = err.error?.error ?? 'Submission failed.';
        this.cdr.detectChanges();
      }
    });
  }

  private connectWs(submissionId: number) {
    this.ws = this.chatService.connectSubmissionChat(submissionId, this.auth.getToken());
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message') this.chatMessages.push(data);
    };
  }

  sendChat() {
    if (!this.chatText.trim() || !this.ws) return;
    this.ws.send(JSON.stringify({ text: this.chatText }));
    this.chatText = '';
  }

  get isOverdue() { return this.assignment ? new Date() > new Date(this.assignment.deadline) : false; }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.ws?.close();
  }
}
