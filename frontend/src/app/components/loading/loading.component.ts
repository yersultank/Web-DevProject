import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-state">
      <div class="loading-icon">◈</div>
      <p>Loading…</p>
    </div>
  `,
  styles: [`
    .loading-state { text-align: center; padding: 72px 24px; color: rgba(255,255,255,0.25); }
    .loading-icon  { font-size: 48px; margin-bottom: 16px; display: inline-block; animation: spin 1.2s linear infinite; }
    p { margin: 0; font-size: 15px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingComponent {}
