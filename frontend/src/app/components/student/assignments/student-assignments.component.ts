import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { MyAssignment } from '../../../models/assignment.model';

@Component({
  selector: 'app-student-assignments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-assignments.component.html',
  styleUrl: './student-assignments.component.css'
})
export class StudentAssignmentsComponent implements OnInit {
  all: MyAssignment[] = [];
  activeTab: 'upcoming' | 'completed' | 'overdue' = 'upcoming';
  loading = true;

  constructor(private assignmentService: AssignmentService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.assignmentService.getMyAssignments().subscribe({
      next: list => { this.all = list; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get upcoming() { return this.all.filter(a => a.status === 'pending'); }
  get completed() { return this.all.filter(a => a.status === 'reviewed'); }
  get overdue()   { return this.all.filter(a => a.status === 'overdue'); }

  get current() {
    if (this.activeTab === 'upcoming') return this.upcoming;
    if (this.activeTab === 'completed') return this.completed;
    return this.overdue;
  }

  open(a: MyAssignment) { this.router.navigate(['/student/assignments', a.id]); }

  isOverdue(deadline: string) { return new Date() > new Date(deadline); }
}
