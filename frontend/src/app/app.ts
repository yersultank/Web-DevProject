import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, interval, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { AnnouncementService } from './services/announcement.service';

interface Toast { text: string; type: 'toxic' | 'info' | 'success'; id: number; }

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  showSidebar = false;
  isAdmin = false;
  username = '';
  initials = '';
  courseName = 'JavaScript Course';

  notifUnread = signal(0);
  announcementUnread = signal(0);
  toasts: Toast[] = [];
  private toastId = 0;

  private subs: Subscription[] = [];
  private pollSub?: Subscription;

  adminNav = [
    { label: 'Dashboard',      icon: '📊', path: '/admin/dashboard' },
    { label: 'Course',         icon: '📚', path: '/admin/course' },
    { label: 'Review',         icon: '✅', path: '/admin/review' },
    { label: 'Students',       icon: '👥', path: '/admin/students' },
    { label: 'Announcements',  icon: '📢', path: '/admin/announcements', badge: 'announcementUnread' },
    { label: 'Settings',       icon: '⚙️', path: '/admin/settings' },
  ];

  studentNav = [
    { label: 'Course',         icon: '📚', path: '/student/course' },
    { label: 'Assignments',    icon: '📝', path: '/student/assignments' },
    { label: 'Chat',           icon: '💬', path: '/student/chat' },
    { label: 'News',           icon: '📢', path: '/student/news', badge: 'announcementUnread' },
    { label: 'Notifications',  icon: '🔔', path: '/student/notifications', badge: 'notifUnread' },
    { label: 'Profile',        icon: '👤', path: '/student/profile' },
  ];

  constructor(
    private auth: AuthService,
    private notifService: NotificationService,
    private announcementService: AnnouncementService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        this.updateShell();
      })
    );
    this.updateShell();
  }

  private updateShell() {
    this.showSidebar = this.auth.isLoggedIn();
    if (this.showSidebar) {
      this.isAdmin = this.auth.isAdmin();
      this.username = this.auth.getUsername();
      this.initials = (this.username[0] ?? '?').toUpperCase();
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  private startPolling() {
    if (this.pollSub) return;
    this.fetchBadges();
    this.pollSub = interval(30000).subscribe(() => this.fetchBadges());
  }

  private stopPolling() {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  private fetchBadges() {
    this.notifService.getUnreadCount().subscribe(r => this.notifUnread.set(r.count));
    this.announcementService.getUnreadCount().subscribe(r => this.announcementUnread.set(r.count));
  }

  getBadge(badge?: string): number {
    if (badge === 'notifUnread') return this.notifUnread();
    if (badge === 'announcementUnread') return this.announcementUnread();
    return 0;
  }

  showToast(text: string, type: 'toxic' | 'info' | 'success' = 'info') {
    const id = ++this.toastId;
    this.toasts.push({ text, type, id });
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 5000);
  }

  logout() {
    this.auth.logout();
    this.stopPolling();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.stopPolling();
  }
}
