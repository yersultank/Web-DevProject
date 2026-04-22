import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profile: UserProfile = { full_name: '', phone: '', office_address: '', department: '', position: '' };
  editForm: Partial<UserProfile> = {};

  isEditing   = false;
  isSaving    = false;
  error       = '';
  success     = '';
  returningId: number | null = null;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadProfile(); }

  goBack(): void {
    this.router.navigate([this.profile.is_staff ? '/dashboard' : '/my-assets']);
  }

  goToHistory(): void {
    this.router.navigate([this.profile.is_staff ? '/history' : '/my-history']);
  }

  loadProfile(): void {
    this.authService.getMyProfile().subscribe({
      next: data => {
        this.profile = data;
        this.cdr.detectChanges();
        if (!data.is_staff) {
          this.authService.getMyAssets().subscribe({
            next: assets => { this.profile = { ...this.profile, assets }; this.cdr.detectChanges(); },
          });
        }
      },
      error: () => { this.error = 'Could not load profile.'; this.cdr.detectChanges(); },
    });
  }

  startEdit(): void {
    this.editForm   = { ...this.profile };
    this.isEditing  = true;
    this.success    = '';
    this.error      = '';
  }

  cancelEdit(): void { this.isEditing = false; this.editForm = {}; }

  saveProfile(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    this.error = '';
    this.success = '';

    this.authService.updateMyProfile(this.editForm).subscribe({
      next: data => {
        this.profile   = { ...data, assets: this.profile.assets };
        this.isSaving  = false;
        this.isEditing = false;
        this.success   = 'Profile saved successfully!';
        setTimeout(() => (this.success = ''), 3000);
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Could not save profile.';
      },
    });
  }

  returnAsset(assignmentId: number): void {
    if (this.returningId !== null) return;
    this.returningId = assignmentId;

    this.authService.returnAsset(assignmentId).subscribe({
      next: () => { this.returningId = null; this.loadProfile(); },
      error: () => {
        this.returningId = null;
        this.error = 'Could not return the asset.';
      },
    });
  }
}
