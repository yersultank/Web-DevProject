import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AuthService, UserListItem } from '../../services/auth.service';
import { Asset, Category } from '../../models/asset.model';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LottieComponent, LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName = 'Admin User';
  userRole = 'admin';

  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  categories: Category[] = [];
  userList: UserListItem[] = [];
  loadError = '';
  loading = false;
  showSuccess = false;

  successOptions: AnimationOptions = {
    path: 'assets/animations/success_check.json',
  };

  // ── Add form ──────────────────────────────────────────────────────────────
  showAddForm = false;

  newName = '';
  newSerial = '';
  newStatus = 'available';
  newCategoryId: number | null = null;
  newDescription = '';
  newImage: File | null = null;

  editingAsset: (Partial<Asset> & { id: number }) | null = null;
  editImage: File | null = null;
  editError = '';

  assigningAsset: Asset | null = null;
  assignUserId: number | null = null;
  assignNotes = '';
  assignError = '';

  searchQuery = '';
  filterStatus = '';
  filterCategory: number | string = '';

  readonly statusOptions = ['available', 'assigned', 'maintenance', 'retired'];
  readonly baseUrl = 'http://127.0.0.1:8000';
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAssets();
    this.loadCategories();
    this.loadUsers();
  }

  goToProfile(): void { this.router.navigate(['/profile']); }
  goToHistory(): void { this.router.navigate(['/history']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }

  // ─── Click 1: Load assets ─────────────────────────────────────────────────
  loadAssets(): void {
    this.loading = true;
    this.loadError = '';
    this.authService.getAssets().subscribe({
      next: (assets) => {
        this.assets = assets;
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.assets = [];
        this.filteredAssets = [];
        this.loadError = 'Could not load assets. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadCategories(): void {
    this.authService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => console.error('Categories load error:', err),
    });
  }

  loadUsers(): void {
    this.authService.getUserList().subscribe({
      next: (users) => {
        this.userList = users;
      },
      error: (err) => console.error('Users load error:', err),
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.editingAsset = null;
  }

  onFileSelect(e: Event): void {
    this.newImage = (e.target as HTMLInputElement).files?.[0] ?? null;
  }

  addAsset(): void {
    if (!this.newName.trim() || !this.newSerial.trim() || !this.newCategoryId) return;

    const fd = new FormData();
    fd.append('name', this.newName.trim());
    fd.append('serial_number', this.newSerial.trim());
    fd.append('status', this.newStatus);
    fd.append('category', String(this.newCategoryId));
    if (this.newDescription.trim()) fd.append('description', this.newDescription.trim());
    if (this.newImage) fd.append('image', this.newImage);

    this.authService.createAsset(fd).subscribe({
      next: (created) => {
        this.assets = [...this.assets, created];
        this.applyFilters();
        this.resetAddForm();
        this.triggerSuccessAnimation();
      },
      error: (err) => {
        this.loadError = err.error?.detail ?? 'Failed to create asset.';
      },
    });
  }

  private resetAddForm(): void {
    this.newName = '';
    this.newSerial = '';
    this.newStatus = 'available';
    this.newCategoryId = null;
    this.newDescription = '';
    this.newImage = null;
    this.showAddForm = false;
  }

  startEdit(asset: Asset): void {
    this.editingAsset = {
      id: asset.id,
      name: asset.name,
      description: asset.description ?? '',
      serial_number: asset.serial_number,
      status: asset.status,
      category: this.extractCategoryId(asset.category),
    };
    this.editImage = null;
    this.editError = '';
    this.showAddForm = false;
    this.assigningAsset = null;
  }

  onEditFileSelect(e: Event): void {
    this.editImage = (e.target as HTMLInputElement).files?.[0] ?? null;
  }

  saveEdit(): void {
    if (!this.editingAsset) return;
    this.editError = '';

    const { id, name, serial_number, status, category, description } = this.editingAsset;
    const fd = new FormData();
    if (name) fd.append('name', name);
    if (serial_number) fd.append('serial_number', serial_number);
    if (status) fd.append('status', status);
    if (category != null) fd.append('category', String(category));
    if (description != null) fd.append('description', description);
    if (this.editImage) fd.append('image', this.editImage);

    this.authService.updateAsset(id, fd).subscribe({
      next: (updated) => {
        this.assets = this.assets.map((a) => (a.id === updated.id ? updated : a));
        this.applyFilters();
        this.editingAsset = null;
        this.editImage = null;
        this.triggerSuccessAnimation();
      },
      error: (err) => {
        this.editError = err.error ? JSON.stringify(err.error) : 'Failed to save changes.';
      },
    });
  }

  cancelEdit(): void {
    this.editingAsset = null;
    this.editError = '';
  }

  deleteAsset(id: number): void {
    if (!confirm('Delete this asset?')) return;
    this.authService.deleteAsset(id).subscribe({
      next: () => {
        this.assets = this.assets.filter((a) => a.id !== id);
        this.applyFilters();
      },
      error: (err) => {
        this.loadError = err.error?.detail ?? 'Failed to delete asset.';
      },
    });
  }

  openAssign(asset: Asset): void {
    this.assigningAsset = asset;
    this.assignUserId = null;
    this.assignNotes = '';
    this.assignError = '';
    this.editingAsset = null;
    this.showAddForm = false;
  }

  cancelAssign(): void {
    this.assigningAsset = null;
  }

  submitAssign(): void {
    if (!this.assigningAsset || !this.assignUserId) return;
    this.assignError = '';

    this.authService
      .assignAsset({
        asset: this.assigningAsset.id,
        user: Number(this.assignUserId),
        notes: this.assignNotes.trim(),
      })
      .subscribe({
        next: () => {
          this.assigningAsset = null;
          this.loadAssets();
        },
        error: (err) => {
          this.assignError =
            err.error?.asset?.[0] ?? err.error?.detail ?? 'Failed to assign asset.';
        },
      });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredAssets = this.assets.filter((a) => {
      const matchSearch =
        !q || a.name.toLowerCase().includes(q) || (a.serial_number ?? '').toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || a.status === this.filterStatus;
      const matchCategory =
        !this.filterCategory || this.extractCategoryId(a.category) === Number(this.filterCategory);
      return matchSearch && matchStatus && matchCategory;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  extractCategoryId(category: number | Category | undefined): number | undefined {
    if (category == null) return undefined;
    return typeof category === 'number' ? category : category.id;
  }

  getCategoryName(asset: Asset): string {
    if (asset.category_name) return asset.category_name;
    const id = this.extractCategoryId(asset.category);
    return this.categories.find((c) => c.id === id)?.name ?? '—';
  }

  getAssetImage(asset: Asset): string {
    if (asset.image) {
      return asset.image.startsWith('http') ? asset.image : `${this.baseUrl}${asset.image}`;
    }
    const cat = this.getCategoryName(asset).toLowerCase();
    const fallbacks: Record<string, string> = {
      hardware: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
      network: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
      software: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
      peripheral: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    };
    return (
      fallbacks[cat] ?? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'
    );
  }

  private triggerSuccessAnimation(): void {
    this.showSuccess = true;
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
    this.successTimer = setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 2500);
  }
}
