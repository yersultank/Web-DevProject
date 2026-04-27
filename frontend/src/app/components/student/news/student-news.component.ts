import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnnouncementService } from '../../../services/announcement.service';
import { Announcement } from '../../../models/announcement.model';

@Component({
  selector: 'app-student-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-news.component.html',
  styleUrl: './student-news.component.css'
})
export class StudentNewsComponent implements OnInit {
  announcements: Announcement[] = [];
  loading = true;

  constructor(private announcementService: AnnouncementService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.announcementService.getAnnouncements().subscribe({
      next: list => { this.announcements = list; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
}
