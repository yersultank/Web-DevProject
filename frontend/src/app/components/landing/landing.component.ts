import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements AfterViewInit, OnInit {
  isLoggedIn = false;
  isAdmin = false;
  stats = {
    assets: '--',
    departments: '--',
    platform: '1'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.loadLiveStats();
  }

  ngAfterViewInit(): void {
    this.renderLucideIcons();
    setTimeout(() => this.renderLucideIcons(), 120);
  }

  get dashboardRoute(): string {
    return this.isLoggedIn ? '/dashboard' : '/login';
  }

  get ctaRoute(): string {
    return this.isLoggedIn ? '/dashboard' : '/login';
  }

  get heroPrimaryLabel(): string {
    return this.isLoggedIn ? 'Open Dashboard' : 'Get Started';
  }

  get dashboardButtonLabel(): string {
    return this.isLoggedIn ? 'View Dashboard' : 'Login to View Dashboard';
  }

  get assetsLabel(): string {
    return this.isLoggedIn && !this.isAdmin ? 'My Assets' : 'Assets';
  }

  get ctaLabel(): string {
    return this.isLoggedIn ? 'Open Dashboard' : 'Sign In';
  }

  private renderLucideIcons(): void {
    const lucide = (window as any).lucide;
    if (lucide?.createIcons) {
      lucide.createIcons();
    }
  }

  private loadLiveStats(): void {
    if (!this.isLoggedIn) {
      return;
    }

    if (this.isAdmin) {
      this.authService
        .getAssets()
        .pipe(catchError(() => of([])))
        .subscribe((assets) => {
          this.stats.assets = String(assets.length);
        });
    } else {
      this.authService
        .getMyAssets()
        .pipe(catchError(() => of([])))
        .subscribe((assets) => {
          this.stats.assets = String(assets.length);
        });
    }

    this.authService
      .getCategories()
      .pipe(catchError(() => of([])))
      .subscribe((categories) => {
        this.stats.departments = String(categories.length);
      });
  }
}
