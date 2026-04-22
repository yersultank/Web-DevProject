import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, StatusLog } from '../../services/auth.service';

interface AssetGroup {
  asset_id: number;
  asset_name: string;
  asset_sn: string;
  entries: (StatusLog & { duration: string })[];
}

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.css',
})
export class UserHistoryComponent implements OnInit {
  groups:   AssetGroup[] = [];
  isLoading = true;
  error     = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.authService.getMyHistory().subscribe({
      next: logs => {
        this.buildGroups(logs);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load history.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildGroups(logs: StatusLog[]): void {
    const map = new Map<number, StatusLog[]>();
    for (const log of logs) {
      if (!map.has(log.asset_id)) map.set(log.asset_id, []);
      map.get(log.asset_id)!.push(log);
    }
    this.groups = [];
    map.forEach((entries, asset_id) => {
      const sorted = [...entries].sort(
        (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
      );
      const withDuration = sorted.map((e, i) => ({
        ...e,
        duration: i < sorted.length - 1
          ? this.fmt(new Date(sorted[i + 1].changed_at).getTime() - new Date(e.changed_at).getTime())
          : this.fmt(Date.now() - new Date(e.changed_at).getTime()),
      })).reverse();
      this.groups.push({ asset_id, asset_name: entries[0].asset_name, asset_sn: entries[0].asset_sn, entries: withDuration });
    });
  }

  private fmt(ms: number): string {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { available: 'Available', assigned: 'Assigned', maintenance: 'Maintenance', retired: 'Retired', '': 'Created' };
    return map[s] ?? s;
  }

  goToAssets():  void { this.router.navigate(['/my-assets']); }
  goToProfile(): void { this.router.navigate(['/profile']); }
  logout():      void { this.authService.logout(); this.router.navigate(['/login']); }
}
