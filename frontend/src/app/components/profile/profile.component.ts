import { Component, OnInit } from '@angular/core';
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
  profile: UserProfile = { phone: '', office_address: '', department: '', position: '' };
  editForm: Partial<UserProfile> = {};
  isEditing = false;
  isSaving  = false;
  error     = '';
  success   = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => this.loadProfile(), 0);
  }

  loadProfile(): void {
    this.error = '';
    this.authService.getMyProfile().subscribe({
      next:  (data) => { this.profile = data; },
      error: ()     => { this.error = 'Could not load profile.'; }
    });
  }

  startEdit(): void {
    this.editForm = {
      phone:          this.profile.phone,
      office_address: this.profile.office_address,
      department:     this.profile.department,
      position:       this.profile.position,
    };
    this.isEditing = true;
    this.success   = '';
    this.error     = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm  = {};
    this.error     = '';
  }

  saveProfile(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    this.error    = '';
    this.success  = '';

    this.authService.updateMyProfile(this.editForm).subscribe({
      next: (data) => {
        this.profile   = data;
        this.isEditing = false;
        this.isSaving  = false;
        this.success   = 'Profile saved successfully!';
        setTimeout(() => (this.success = ''), 3000);
      },
      error: () => {
        this.error    = 'Failed to save profile.';
        this.isSaving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate([this.profile.is_staff ? '/dashboard' : '/my-assets']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}