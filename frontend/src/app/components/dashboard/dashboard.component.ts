import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { Asset } from '../../models/asset.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
/**
 * Shows the asset dashboard with admin actions and the current asset list.
 */
export class DashboardComponent implements OnInit {
  userName: string = 'Admin User';
  userRole: string = 'admin';

  assets: Asset[] = [];
  isLoading = false;
  loadError = '';

  showAddForm = false;
  newAssetName = '';
  newAssetStatus = 'Available';

  constructor(private authService: AuthService) {}

  /**
   * Triggers initial API read when dashboard opens.
   */
  ngOnInit(): void {
    this.loadAssets();
  }

  /**
   * Loads assets through service and updates loading + error UI states.
   */
  loadAssets(): void {
    // Defense note: true means spinner is visible while API request is in progress.
    this.isLoading = true;
    // Defense note: clear previous error before a new request.
    this.loadError = '';

    this.authService.getAssets().subscribe({
      next: (assets) => {
        this.assets = assets;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Defense note: friendly message for users instead of technical backend errors.
        this.loadError = 'Could not load assets. Please try again.';
      }
    });
  }

  /**
   * Opens and closes the inline add form for admin users.
   */
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  /**
   * Adds a new local asset row in the list for simple demo interaction.
   */
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

  /**
   * Removes an asset from the local table by id.
   */
  deleteAsset(id: number) {
    this.assets = this.assets.filter(a => a.id !== id);
  }
}