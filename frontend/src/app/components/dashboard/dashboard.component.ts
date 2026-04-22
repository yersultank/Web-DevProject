import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserListItem } from '../../services/auth.service';
import { Asset, Category } from '../../models/asset.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  // ── Data ───────────────────────────────────────────────────────────────────
  assets:         Asset[]    = [];
  filteredAssets: Asset[]    = [];
  categories:     Category[] = [];
  userList:       UserListItem[] = [];

  // ── UI state ───────────────────────────────────────────────────────────────
  loadError  = '';
  showAddForm = false;

  // ── Add form ───────────────────────────────────────────────────────────────
  newName        = '';
  newSerial      = '';
  newStatus      = 'available';
  newCategoryId: number | null = null;
  newDescription = '';
  newImage:      File | null = null;

  // ── Edit form ──────────────────────────────────────────────────────────────
  editingAsset: (Partial<Asset> & { id: number }) | null = null;
  editImage:    File | null = null;
  editError     = '';

  // ── Assign modal ──────────────────────────────────────────────────────────
  assigningAsset: Asset | null = null;
  assignUserId:   number | null = null;
  assignNotes     = '';
  assignError     = '';

  // ── Filters ────────────────────────────────────────────────────────────────
  searchQuery     = '';
  filterStatus    = '';
  filterCategory: number | string = '';

  readonly statusOptions = ['available', 'assigned', 'maintenance', 'retired'];
  readonly baseUrl       = 'http://127.0.0.1:8000';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadAssets();
    this.loadCategories();
    this.loadUsers();
  }

  goToProfile(): void { this.router.navigate(['/profile']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ── Load ───────────────────────────────────────────────────────────────────

  loadAssets(): void {
    this.loadError = '';
    this.authService.getAssets().subscribe({
      next:  assets => { this.assets = assets; this.applyFilters(); },
      error: ()     => { this.loadError = 'Could not load assets.'; },
    });
  }

  loadCategories(): void {
    this.authService.getCategories().subscribe({
      next:  cats => { this.categories = cats; },
      error: err  => console.error('Categories:', err),
    });
  }

  loadUsers(): void {
    this.authService.getUserList().subscribe({
      next:  users => { this.userList = users; },
      error: err   => console.error('Users:', err),
    });
  }

  // ── Add asset ──────────────────────────────────────────────────────────────

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
    fd.append('name',          this.newName.trim());
    fd.append('serial_number', this.newSerial.trim());
    fd.append('status',        this.newStatus);
    fd.append('category',      String(this.newCategoryId));
    if (this.newDescription.trim()) fd.append('description', this.newDescription.trim());
    if (this.newImage)              fd.append('image',       this.newImage);

    this.authService.createAsset(fd).subscribe({
      next:  created => { this.assets = [...this.assets, created]; this.applyFilters(); this.resetAddForm(); },
      error: ()      => { this.loadError = 'Failed to create asset.'; },
    });
  }

  private resetAddForm(): void {
    this.newName = ''; this.newSerial = ''; this.newStatus = 'available';
    this.newCategoryId = null; this.newDescription = ''; this.newImage = null;
    this.showAddForm = false;
  }

  // ── Edit asset ─────────────────────────────────────────────────────────────

  startEdit(asset: Asset): void {
    this.editingAsset = {
      id:            asset.id,
      name:          asset.name,
      description:   asset.description ?? '',
      serial_number: asset.serial_number,
      status:        asset.status,
      category:      this.extractCategoryId(asset.category),
    };
    this.editImage  = null;
    this.editError  = '';
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
    if (name)             fd.append('name',          name);
    if (serial_number)    fd.append('serial_number', serial_number);
    if (status)           fd.append('status',        status);
    if (category != null) fd.append('category',      String(category));
    if (description != null) fd.append('description', description);
    if (this.editImage)   fd.append('image',         this.editImage);

    this.authService.updateAsset(id, fd).subscribe({
      next: updated => {
        this.assets = this.assets.map(a => a.id === updated.id ? updated : a);
        this.applyFilters();
        this.editingAsset = null;
      },
      error: err => {
        const detail = err.error ? JSON.stringify(err.error) : 'Server error.';
        this.editError = `Failed to save: ${detail}`;
      },
    });
  }

  cancelEdit(): void { this.editingAsset = null; this.editError = ''; }

  // ── Delete asset ───────────────────────────────────────────────────────────

  deleteAsset(id: number): void {
    if (!confirm('Delete this asset?')) return;
    this.authService.deleteAsset(id).subscribe({
      next:  () => { this.assets = this.assets.filter(a => a.id !== id); this.applyFilters(); },
      error: () => { this.loadError = 'Failed to delete asset.'; },
    });
  }

  // ── Assign modal ───────────────────────────────────────────────────────────

  openAssign(asset: Asset): void {
    this.assigningAsset = asset;
    this.assignUserId   = null;
    this.assignNotes    = '';
    this.assignError    = '';
    this.editingAsset   = null;
    this.showAddForm    = false;
  }

  cancelAssign(): void { this.assigningAsset = null; }

  submitAssign(): void {
    if (!this.assigningAsset || !this.assignUserId) return;
    this.assignError = '';

    this.authService.assignAsset({
      asset: this.assigningAsset.id,
      user:  Number(this.assignUserId),
      notes: this.assignNotes.trim(),
    }).subscribe({
      next: () => { this.assigningAsset = null; this.loadAssets(); },
      error: err => {
        this.assignError = err.error?.asset?.[0] ?? err.error?.detail ?? 'Failed to assign asset.';
      },
    });
  }

  // ── Filters ────────────────────────────────────────────────────────────────

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredAssets = this.assets.filter(a => {
      const matchSearch   = !q || a.name.toLowerCase().includes(q) || (a.serial_number ?? '').toLowerCase().includes(q);
      const matchStatus   = !this.filterStatus || a.status === this.filterStatus;
      const matchCategory = !this.filterCategory || this.extractCategoryId(a.category) === Number(this.filterCategory);
      return matchSearch && matchStatus && matchCategory;
    });
  }

  onFilterChange(): void { this.applyFilters(); }

  // ── Helpers ────────────────────────────────────────────────────────────────

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
      return asset.image.startsWith('http') ? asset.image : `${this.baseUrl}${asset.image}`;
    }
    const cat = this.getCategoryName(asset).toLowerCase();
    const fallbacks: Record<string, string> = {
      hardware:   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
      network:    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
      software:   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
      peripheral: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    };
    return fallbacks[cat] ?? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';
  }
}
