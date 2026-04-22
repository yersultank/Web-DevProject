import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AuthService } from '../../services/auth.service';
import { MyAsset } from '../../models/user-profile.model';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  templateUrl: './my-assets.component.html',
  styleUrl: './my-assets.component.css',
})
export class MyAssetsComponent implements OnInit {
  assets: MyAsset[] = [];
  error = '';
  returnError = '';
  returningId: number | null = null;
  emptyOptions: AnimationOptions = { path: 'assets/animations/empty_state.json' };
  readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadMyAssets(); }

  loadMyAssets(): void {
    this.error = '';
    this.authService.getMyAssets().subscribe({
      next:  data => { this.assets = data; this.cdr.detectChanges(); },
      error: ()   => { this.error = 'Could not load your assets.'; this.cdr.detectChanges(); },
    });
  }

  returnAsset(assignmentId: number): void {
    if (this.returningId !== null) return;
    this.returningId = assignmentId;
    this.returnError = '';

    this.authService.returnAsset(assignmentId).subscribe({
      next: () => {
        this.returningId = null;
        this.loadMyAssets();
      },
      error: () => {
        this.returningId = null;
        this.returnError = 'Could not return the asset. Please try again.';
      },
    });
  }

  goToProfile(): void { this.router.navigate(['/profile']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getImage(asset: MyAsset): string {
    if (asset.image) {
      return asset.image.startsWith('http') ? asset.image : `${this.baseUrl}${asset.image}`;
    }
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';
  }
}
