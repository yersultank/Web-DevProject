import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface AdminUserProfile {
  id: number;
  username: string;
  full_name: string;
  phone: string;
  office_address: string;
  department: string;
  position: string;
  assets?: any[];
}

@Component({
  selector: 'app-admin-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-user-profile.component.html',
  styleUrl: './admin-user-profile.component.css',
})
export class AdminUserProfileComponent implements OnInit {
  profile: AdminUserProfile = {
    id: 0, username: '', full_name: '', phone: '',
    office_address: '', department: '', position: '',
  };
  editForm: Partial<AdminUserProfile> = {};
  userId = 0;
  isEditing = false;
  isSaving = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getUserProfile(this.userId).subscribe({
      next: data => { this.profile = data; this.cdr.detectChanges(); },
      error: () => { this.error = 'Could not load user profile.'; this.cdr.detectChanges(); },
    });
  }

  startEdit(): void {
    this.editForm = { ...this.profile };
    this.isEditing = true;
    this.success = '';
    this.error = '';
  }

  cancelEdit(): void { this.isEditing = false; this.editForm = {}; }

  saveProfile(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    this.error = '';
    const { full_name, phone, office_address, department, position } = this.editForm;
    this.authService.updateUserProfile(this.userId, { full_name, phone, office_address, department, position }).subscribe({
      next: data => {
        this.profile = { ...data, assets: this.profile.assets };
        this.isSaving = false;
        this.isEditing = false;
        this.success = 'Profile updated!';
        setTimeout(() => { this.success = ''; this.cdr.detectChanges(); }, 3000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Could not save profile.';
        this.cdr.detectChanges();
      },
    });
  }

  goToDashboard(): void { this.router.navigate(['/dashboard']); }
  goToHistory():   void { this.router.navigate(['/history']); }
  goToProfile():   void { this.router.navigate(['/profile']); }
  logout():        void { this.authService.logout(); this.router.navigate(['/login']); }
}
