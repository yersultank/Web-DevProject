import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-assets.component.html',
  styleUrl: './my-assets.component.css',
})
export class MyAssetsComponent implements OnInit {
  assets: any[] = [];
  error = '';
  readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void { this.loadMyAssets(); }
  

  loadMyAssets(): void {
    this.error = '';
    this.authService.getMyAssets().subscribe({
      next:  (data) => { this.assets = data; },
      error: ()     => { this.error = 'Could not load your assets.'; }
    });
  }

  goToProfile(): void { this.router.navigate(['/profile']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getImage(asset: any): string {
    if (asset.image) {
      return asset.image.startsWith('http') ? asset.image : `${this.baseUrl}${asset.image}`;
    }
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';
  }
}
