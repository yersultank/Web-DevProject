import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { DashboardData } from '../../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  data: DashboardData | null = null;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.adminService.getDashboard().subscribe({
      next: d => { this.data = d; this.cdr.detectChanges(); setTimeout(() => this.drawChart(), 100); },
      error: () => this.cdr.detectChanges()
    });
  }

  ngAfterViewInit() {}

  drawChart() {
    if (!this.data || !this.chartCanvas) return;
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts = this.data.chart_data;
    const vals = pts.map(p => p.count);
    const labels = pts.map(p => p.date.slice(5));
    const max = Math.max(...vals, 1);
    const W = canvas.width, H = canvas.height;
    const padL = 30, padB = 24, padT = 12, padR = 12;
    const gW = W - padL - padR, gH = H - padB - padT;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#3a3a5c';
    ctx.lineWidth = 1;

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padT + gH - (i / 4) * gH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.fillStyle = '#6b6b8a'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(String(Math.round((i / 4) * max)), padL - 4, y + 3);
    }

    // Line
    ctx.strokeStyle = '#6264A7'; ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = padL + (i / (pts.length - 1 || 1)) * gW;
      const y = padT + gH - (p.count / max) * gH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots + labels
    pts.forEach((p, i) => {
      const x = padL + (i / (pts.length - 1 || 1)) * gW;
      const y = padT + gH - (p.count / max) * gH;
      ctx.fillStyle = '#6264A7'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a0a0b8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(labels[i], x, H - 6);
    });
  }

  openSubmission(id: number) { this.router.navigate(['/admin/review'], { queryParams: { id } }); }
  openStudent(id: number) { this.router.navigate(['/admin/students', id]); }
}
