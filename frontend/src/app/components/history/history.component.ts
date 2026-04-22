import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, StatusLog } from '../../services/auth.service';

interface AssetGroup {
  asset_id: number;
  asset_name: string;
  asset_sn: string;
  entries: (StatusLog & { duration: string })[];
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  groups:    AssetGroup[] = [];
  allLogs:   StatusLog[]  = [];
  isLoading  = true;
  error      = '';
  filterAsset = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.authService.getHistory().subscribe({
      next: logs => {
        this.allLogs = logs;
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
          ? this.formatDuration(new Date(sorted[i + 1].changed_at).getTime() - new Date(e.changed_at).getTime())
          : this.formatDuration(Date.now() - new Date(e.changed_at).getTime()),
      })).reverse();

      this.groups.push({
        asset_id,
        asset_name: entries[0].asset_name,
        asset_sn:   entries[0].asset_sn,
        entries:    withDuration,
      });
    });

    if (this.filterAsset) {
      this.groups = this.groups.filter(g =>
        g.asset_name.toLowerCase().includes(this.filterAsset.toLowerCase()) ||
        g.asset_sn.toLowerCase().includes(this.filterAsset.toLowerCase())
      );
    }
  }

  onFilter(): void { this.buildGroups(this.allLogs); }

  private formatDuration(ms: number): string {
    const total = Math.floor(ms / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      available: 'Available', assigned: 'Assigned',
      maintenance: 'Maintenance', retired: 'Retired', '': 'Created',
    };
    return map[s] ?? s;
  }

  goToDashboard(): void { this.router.navigate(['/dashboard']); }
  goToProfile():   void { this.router.navigate(['/profile']); }
  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}
