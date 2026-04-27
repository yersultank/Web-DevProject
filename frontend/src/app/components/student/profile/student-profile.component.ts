import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.css'
})
export class StudentProfileComponent implements OnInit {
  profile: any = null;
  fullName = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  saving = false;
  msg = '';
  error = '';

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: p => { this.profile = p; this.fullName = p.full_name; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }

  get initials() {
    return (this.profile?.full_name || this.profile?.username || '?')[0].toUpperCase();
  }

  saveProfile() {
    this.saving = true; this.msg = ''; this.error = '';
    const data: any = { full_name: this.fullName };
    if (this.newPassword) {
      if (this.newPassword !== this.confirmPassword) { this.error = 'Passwords do not match.'; this.saving = false; return; }
      data.current_password = this.currentPassword;
      data.new_password = this.newPassword;
    }
    this.auth.updateProfile(data).subscribe({
      next: () => { this.saving = false; this.msg = 'Profile updated!'; this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.cdr.detectChanges(); },
      error: (e) => { this.saving = false; this.error = e.error?.error ?? 'Update failed.'; this.cdr.detectChanges(); }
    });
  }
}
