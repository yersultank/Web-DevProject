import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userName: string = 'Admin User';
  userRole: string = 'admin'; // Поменяй на 'employee' для теста

  assets = [
    { id: 1, name: 'Laptop Dell', status: 'In Use' },
    { id: 2, name: 'Monitor LG', status: 'Available' }
  ];
}