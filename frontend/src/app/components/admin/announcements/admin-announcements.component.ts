import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementService } from '../../../services/announcement.service';
import { Announcement } from '../../../models/announcement.model';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-announcements.component.html',
  styleUrl: './admin-announcements.component.css'
})
export class AdminAnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  text = '';
  selectedFile: File | null = null;
  sending = false;
  showDeleteModal = false;
  deleteId: number | null = null;

  constructor(private announcementService: AnnouncementService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.announcementService.getAnnouncements().subscribe({
      next: a => { this.announcements = a; this.cdr.detectChanges(); },
      error: () => this.cdr.detectChanges()
    });
  }

  onFileChange(e: Event) {
    this.selectedFile = (e.target as HTMLInputElement).files?.[0] ?? null;
  }

  send() {
    if (!this.text.trim()) return;
    this.sending = true;
    const fd = new FormData();
    fd.append('text', this.text);
    if (this.selectedFile) fd.append('photo', this.selectedFile);
    this.announcementService.createAnnouncement(fd).subscribe(() => {
      this.sending = false; this.text = ''; this.selectedFile = null; this.load();
    });
  }

  confirmDelete(id: number) { this.deleteId = id; this.showDeleteModal = true; }

  doDelete() {
    if (this.deleteId === null) return;
    this.announcementService.deleteAnnouncement(this.deleteId).subscribe(() => {
      this.showDeleteModal = false; this.deleteId = null; this.load();
    });
  }
}
