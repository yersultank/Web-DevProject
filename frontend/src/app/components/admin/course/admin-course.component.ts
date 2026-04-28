import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { CourseService } from '../../../services/course.service';
import { Course, Topic, Lesson } from '../../../models/course.model';

@Component({
  selector: 'app-admin-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-course.component.html',
  styleUrl: './admin-course.component.css'
})
export class AdminCourseComponent implements OnInit {
  course: Course | null = null;
  selectedLesson: Lesson | null = null;
  lessonContent: SafeHtml = '';
  expandedTopics = new Set<number>();
  loading = true;

  editingLesson = { title: '', content: '', order: 0 };
  editingAssignment = { title: '', description: '', deadline: '' };
  saving = false;
  savingAssignment = false;
  msg = '';
  assignmentMsg = '';

  newTopicTitle = '';
  addingTopic = false;
  showDeleteModal = false;
  deleteTarget: { type: 'topic' | 'lesson'; id: number; count: number } | null = null;

  constructor(private courseService: CourseService, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef, private http: HttpClient) {}

  ngOnInit() { this.load(); }

  load() {
    this.courseService.getCourse().subscribe({
      next: c => { this.course = c; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  toggle(topic: Topic) {
    this.expandedTopics.has(topic.id) ? this.expandedTopics.delete(topic.id) : this.expandedTopics.add(topic.id);
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson = lesson;
    this.editingLesson = { title: lesson.title, content: lesson.content, order: lesson.order };
    this.lessonContent = this.sanitizer.bypassSecurityTrustHtml(lesson.content);
    this.editingAssignment = { title: '', description: '', deadline: '' };
    this.assignmentMsg = '';
    if (lesson.assignment_id) {
      this.http.get<any>(`http://127.0.0.1:8000/api/assignments/${lesson.assignment_id}/`).subscribe({
        next: a => {
          const dl = a.deadline ? a.deadline.slice(0, 16) : '';
          this.editingAssignment = { title: a.title, description: a.description, deadline: dl };
          this.cdr.detectChanges();
        }
      });
    }
  }

  addTopic() {
    if (!this.newTopicTitle.trim()) return;
    this.courseService.createTopic({ title: this.newTopicTitle }).subscribe(() => {
      this.newTopicTitle = ''; this.addingTopic = false; this.load();
    });
  }

  addLesson(topicId: number) {
    this.courseService.createLesson({ topic: topicId, title: 'New Lesson', content: '' }).subscribe(() => this.load());
  }

  saveLesson() {
    if (!this.selectedLesson) return;
    this.saving = true;
    this.courseService.updateLesson(this.selectedLesson.id, this.editingLesson).subscribe(() => {
      this.saving = false; this.msg = 'Saved!'; this.load();
      setTimeout(() => this.msg = '', 2000);
    });
  }

  confirmDelete(type: 'topic' | 'lesson', id: number, count: number) {
    this.deleteTarget = { type, id, count };
    if (count === 0) { this.doDelete(); } else { this.showDeleteModal = true; }
  }

  doDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    const obs = type === 'topic'
      ? this.courseService.deleteTopic(id, true)
      : this.courseService.deleteLesson(id, true);
    obs.subscribe(() => {
      this.showDeleteModal = false;
      this.deleteTarget = null;
      if (this.selectedLesson?.id === id) this.selectedLesson = null;
      this.load();
    });
  }

  saveAssignment() {
    if (!this.selectedLesson || !this.editingAssignment.title.trim()) return;
    this.savingAssignment = true;
    this.assignmentMsg = '';
    const payload = {
      lesson: this.selectedLesson.id,
      title: this.editingAssignment.title,
      description: this.editingAssignment.description,
      deadline: this.editingAssignment.deadline,
    };
    const req = this.selectedLesson.assignment_id
      ? this.courseService.updateAssignment(this.selectedLesson.assignment_id, payload)
      : this.courseService.createAssignment(payload);
    req.subscribe({
      next: a => {
        this.savingAssignment = false;
        this.assignmentMsg = 'Saved!';
        if (!this.selectedLesson!.assignment_id) {
          this.selectedLesson!.assignment_id = a.id;
        }
        setTimeout(() => { this.assignmentMsg = ''; this.cdr.detectChanges(); }, 2000);
        this.cdr.detectChanges();
      },
      error: () => { this.savingAssignment = false; this.cdr.detectChanges(); }
    });
  }

  updateContent(event: Event) {
    this.editingLesson.content = (event.target as HTMLTextAreaElement).value;
    this.lessonContent = this.sanitizer.bypassSecurityTrustHtml(this.editingLesson.content);
  }
}
