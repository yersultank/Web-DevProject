import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { Submission, SubmissionComment } from '../../../models/assignment.model';

@Component({
  selector: 'app-admin-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-review.component.html',
  styleUrl: './admin-review.component.css'
})
export class AdminReviewComponent implements OnInit, OnDestroy {
  all: Submission[] = [];
  activeTab: 'pending' | 'all' | 'reviewed' = 'pending';
  selected: Submission | null = null;
  score: number | null = null;
  feedback = '';
  submitting = false;
  codeOutput = '';
  chatMessages: SubmissionComment[] = [];
  chatText = '';
  private ws: WebSocket | null = null;
  userId = 0;

  constructor(
    private assignmentService: AssignmentService,
    private chatService: ChatService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.load();
    this.route.queryParams.subscribe(p => {
      if (p['id']) setTimeout(() => this.selectById(Number(p['id'])), 500);
    });
  }

  load() {
    this.assignmentService.getAdminSubmissions().subscribe({
      next: list => { this.all = list; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }

  get filtered() {
    if (this.activeTab === 'pending') return this.all.filter(s => s.status === 'pending');
    if (this.activeTab === 'reviewed') return this.all.filter(s => s.status === 'reviewed');
    return this.all;
  }

  selectById(id: number) {
    const sub = this.all.find(s => s.id === id);
    if (sub) this.select(sub);
  }

  select(sub: Submission) {
    this.selected = sub;
    this.score = sub.score;
    this.feedback = sub.feedback;
    this.codeOutput = '';
    this.ws?.close();
    this.assignmentService.getSubmission(sub.id).subscribe({
      next: full => { this.chatMessages = full.comments ?? []; this.connectWs(sub.id); this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }

  submitReview() {
    if (!this.selected || this.score === null) return;
    this.submitting = true;
    this.assignmentService.reviewSubmission(this.selected.id, this.score, this.feedback).subscribe({
      next: updated => {
        this.submitting = false;
        const idx = this.all.findIndex(s => s.id === updated.id);
        if (idx >= 0) this.all[idx] = updated;
        this.selected = updated;
        this.cdr.detectChanges();
      },
      error: () => { this.submitting = false; this.cdr.detectChanges(); }
    });
  }

  runCode() {
    if (!this.selected?.code_answer) return;
    try {
      const logs: string[] = [];
      const orig = console.log;
      console.log = (...a) => logs.push(a.map(String).join(' '));
      // eslint-disable-next-line no-new-func
      new Function(this.selected.code_answer)();
      console.log = orig;
      this.codeOutput = logs.join('\n') || '(no output)';
    } catch (e: any) { this.codeOutput = 'Error: ' + e.message; }
  }

  private connectWs(id: number) {
    this.ws = this.chatService.connectSubmissionChat(id, this.auth.getToken());
    this.ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === 'message') this.chatMessages.push(d);
    };
  }

  sendChat() {
    if (!this.chatText.trim() || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ text: this.chatText }));
    this.chatText = '';
  }

  ngOnDestroy() { this.ws?.close(); }
}
