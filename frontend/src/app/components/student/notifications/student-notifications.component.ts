import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-student-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-notifications.component.html',
  styleUrl: './student-notifications.component.css'
})
export class StudentNotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;

  constructor(private notifService: NotificationService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.notifService.getNotifications().subscribe({
      next: list => { this.notifications = list; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe(() => {
      this.notifications = this.notifications.map(n => ({ ...n, is_read: true }));
      this.cdr.detectChanges();
    });
  }

  navigate(link: string) {
    if (link) this.router.navigateByUrl(link);
  }

  icon(type: string) {
    const icons: Record<string, string> = { chat: '💬', toxic: '⚠️', announcement: '📢', assignment: '📝', lesson: '📚' };
    return icons[type] ?? '🔔';
  }
}
