import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Asset, Category } from '../../models/asset.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  userName = 'Admin User';
  userRole = 'admin';

  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  categories: Category[] = [];
  isLoading = false;
  loadError = '';

  // ── Add form ─────────────────────────────────────────────────────────────
  showAddForm = false;
  newAssetName = '';
  newAssetDescription = '';
  newAssetSerialNumber = '';
  newAssetStatus = 'available';
  newAssetCategoryId: number | null = null;
  newAssetImage: File | null = null;

  // ── Edit form ─────────────────────────────────────────────────────────────
  // Partial<Asset> чтобы держать все поля включая description
  editingAsset: (Partial<Asset> & { id: number }) | null = null;
  editingImage: File | null = null;

  // ── Filters ───────────────────────────────────────────────────────────────
  searchQuery = '';
  filterStatus = '';
  filterCategoryId: number | null = null;

  // Значения совпадают с Django TextChoices ('available', 'assigned', ...)
  readonly statusOptions = ['available', 'assigned', 'maintenance', 'retired'];
  readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAssets();
    this.loadCategories();
  }

  // ─── Load ────────────────────────────────────────────────────────────────
  loadAssets(): void {
    this.isLoading = true;
    this.loadError = '';

    this.authService.getAssets().subscribe({
      next: (assets) => {
        this.assets = assets;
        this.applyFilters();
        this.isLoading = false;
        // FIX: принудительно запускаем change detection,
        // чтобы скелетон убрался сразу без взаимодействия с UI
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Could not load assets. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this.authService.getCategories().subscribe({
      next: (cats) => { this.categories = cats; },
      error: (err) => console.error('Categories error:', err)
    });
  }

  // ─── Add ─────────────────────────────────────────────────────────────────
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.editingAsset = null;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newAssetImage = input.files?.[0] ?? null;
  }

  addAsset(): void {
    if (!this.newAssetName.trim() || !this.newAssetSerialNumber.trim() || !this.newAssetCategoryId) return;

    // FormData — обязателен для отправки файла (image)
    const fd = new FormData();
    fd.append('name', this.newAssetName.trim());
    fd.append('serial_number', this.newAssetSerialNumber.trim());
    fd.append('status', this.newAssetStatus);
    fd.append('category', String(this.newAssetCategoryId));
    if (this.newAssetDescription.trim()) fd.append('description', this.newAssetDescription.trim());
    if (this.newAssetImage) fd.append('image', this.newAssetImage);

    this.authService.createAsset(fd).subscribe({
      next: (created) => {
        this.assets = [...this.assets, created];
        this.applyFilters();
        this.resetForm();
      },
      error: (err) => {
        console.error('Create error:', err);
        this.loadError = 'Failed to create asset.';
      }
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  deleteAsset(id: number): void {
    this.authService.deleteAsset(id).subscribe({
      next: () => {
        this.assets = this.assets.filter(a => a.id !== id);
        this.applyFilters();
      },
      error: () => { this.loadError = 'Failed to delete asset.'; }
    });
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────
  startEdit(asset: Asset): void {
    this.editingAsset = {
      id: asset.id,
      name: asset.name,
      description: asset.description ?? '',
      serial_number: asset.serial_number,
      status: asset.status,
      category: this.extractCategoryId(asset.category),
    };
    this.editingImage = null;
    this.showAddForm = false;
  }

  onEditFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editingImage = input.files?.[0] ?? null;
  }

  saveEdit(): void {
    if (!this.editingAsset) return;
    const { id, name, serial_number, status, category, description } = this.editingAsset;

    const fd = new FormData();
    if (name)            fd.append('name', name);
    if (serial_number)   fd.append('serial_number', serial_number);
    if (status)          fd.append('status', status);
    if (category != null) fd.append('category', String(category));
    if (description != null) fd.append('description', description);
    if (this.editingImage) fd.append('image', this.editingImage);

    this.authService.updateAsset(id, fd).subscribe({
      next: (updated) => {
        this.assets = this.assets.map(a => a.id === updated.id ? updated : a);
        this.applyFilters();
        this.editingAsset = null;
        this.editingImage = null;
      },
      error: () => { this.loadError = 'Failed to update asset.'; }
    });
  }

  cancelEdit(): void {
    this.editingAsset = null;
    this.editingImage = null;
  }

  // ─── Filters & helpers ────────────────────────────────────────────────────
  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredAssets = this.assets.filter(a => {
      const matchesSearch = !q ||
        a.name.toLowerCase().includes(q) ||
        (a.serial_number ?? '').toLowerCase().includes(q);
      const matchesStatus   = !this.filterStatus     || a.status === this.filterStatus;
      const matchesCategory = !this.filterCategoryId ||
        this.extractCategoryId(a.category) === this.filterCategoryId;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  onFilterChange(): void { this.applyFilters(); }

  extractCategoryId(category: number | Category | undefined): number | undefined {
    if (category == null) return undefined;
    return typeof category === 'number' ? category : category.id;
  }

  getCategoryName(asset: Asset): string {
    if (asset.category_name) return asset.category_name;
    const id = this.extractCategoryId(asset.category);
    return this.categories.find(c => c.id === id)?.name ?? '—';
  }

  getAssetImage(asset: Asset): string {
    if (asset.image) {
      // Django возвращает относительный путь (/media/...), добавляем хост
      return asset.image.startsWith('http') ? asset.image : `${this.baseUrl}${asset.image}`;
    }
    const cat = this.getCategoryName(asset).toLowerCase();
    const fallbacks: Record<string, string> = {
      'hardware':   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
      'network':    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
      'software':   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
      'peripheral': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    };
    return fallbacks[cat] ?? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';
  }

  private resetForm(): void {
    this.newAssetName = '';
    this.newAssetDescription = '';
    this.newAssetSerialNumber = '';
    this.newAssetStatus = 'available';
    this.newAssetCategoryId = null;
    this.newAssetImage = null;
    this.showAddForm = false;
  }
}