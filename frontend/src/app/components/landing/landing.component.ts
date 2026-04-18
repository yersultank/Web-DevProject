import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  features = [
    { title: 'Track Assets', description: 'Manage all company equipment' },
    { title: 'Assign Resources', description: 'Assign assets to employees' },
    { title: 'Monitor Conditions', description: 'Log asset condition reports' }
  ];

  isLoggedIn = false;

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('access_token');
  }
}
