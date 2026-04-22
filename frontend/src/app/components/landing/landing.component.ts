import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.renderLucideIcons();
    setTimeout(() => this.renderLucideIcons(), 120);
  }

  private renderLucideIcons(): void {
    const lucide = (window as any).lucide;
    if (lucide?.createIcons) {
      lucide.createIcons();
    }
  }
}
