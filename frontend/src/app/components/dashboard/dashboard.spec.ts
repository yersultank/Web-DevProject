import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { Asset } from '../../models/asset.model';

describe('Dashboard', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const assets: Asset[] = [
    {
      id: 1,
      name: 'Demo Laptop',
      serial_number: 'DEMO-00001',
      status: 'available',
      category: 1,
      category_name: 'Laptop',
    },
    {
      id: 2,
      name: 'Demo Monitor',
      serial_number: 'DEMO-00002',
      status: 'maintenance',
      category: 2,
      category_name: 'Monitor',
    },
  ];

  const authServiceMock = {
    getAssets:      vi.fn().mockReturnValue(of(assets)),
    getCategories:  vi.fn().mockReturnValue(of([])),
    getUserList:    vi.fn().mockReturnValue(of([])),
    createAsset:    vi.fn(),
    deleteAsset:    vi.fn(),
    updateAsset:    vi.fn(),
  } as Partial<AuthService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads assets into filtered list on init', () => {
    expect(authServiceMock.getAssets).toHaveBeenCalled();
    expect(component.assets.length).toBe(2);
    expect(component.filteredAssets.length).toBe(2);
  });

  it('applies search and status filters', () => {
    component.searchQuery = 'laptop';
    component.filterStatus = 'available';
    component.applyFilters();

    expect(component.filteredAssets.length).toBe(1);
    expect(component.filteredAssets[0].name).toBe('Demo Laptop');
  });
});
