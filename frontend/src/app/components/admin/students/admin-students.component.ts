import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { Student } from '../../../models/user.model';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit {
  students: Student[] = [];
  search = '';
  showModal = false;
  newUsername = '';
  newPassword = '';
  newFullName = '';
  creating = false;
  createError = '';

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.adminService.getStudents().subscribe({
      next: s => { this.students = s; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }

  get filtered() {
    const q = this.search.toLowerCase();
    return this.students.filter(s => s.username.toLowerCase().includes(q) || s.full_name.toLowerCase().includes(q));
  }

  initials(s: Student) { return (s.full_name || s.username)[0].toUpperCase(); }

  open(id: number) { this.router.navigate(['/admin/students', id]); }

  create() {
    if (!this.newUsername.trim() || !this.newPassword.trim()) { this.createError = 'Username and password required.'; return; }
    this.creating = true; this.createError = '';
    this.adminService.createStudent({ username: this.newUsername, password: this.newPassword, full_name: this.newFullName }).subscribe({
      next: () => { this.creating = false; this.showModal = false; this.newUsername = ''; this.newPassword = ''; this.newFullName = ''; this.cdr.detectChanges(); this.load(); },
      error: (e) => { this.creating = false; this.createError = e.error?.username?.[0] ?? 'Failed to create student.'; this.cdr.detectChanges(); }
    });
  }
}
