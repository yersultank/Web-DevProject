import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // И здесь
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userName: string = 'Admin User';
  userRole: string = 'admin';

  assets = [
    { id: 1, name: 'Laptop Dell', status: 'In Use' },
    { id: 2, name: 'Monitor LG', status: 'Available' }
  ];

  showAddForm = false;
  newAssetName = '';
  newAssetStatus = 'Available';

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addAsset() {
    if (this.newAssetName.trim()) {
      const newId = this.assets.length + 1;
      this.assets.push({
        id: newId,
        name: this.newAssetName,
        status: this.newAssetStatus
      });
      this.newAssetName = '';
      this.showAddForm = false;
    }
  }

  deleteAsset(id: number) {
    this.assets = this.assets.filter(a => a.id !== id);
  }
}