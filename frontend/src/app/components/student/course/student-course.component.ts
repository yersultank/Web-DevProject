import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CourseService } from '../../../services/course.service';
import { Course, Topic, Lesson } from '../../../models/course.model';

@Component({
  selector: 'app-student-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-course.component.html',
  styleUrl: './student-course.component.css'
})
export class StudentCourseComponent implements OnInit {
  course: Course | null = null;
  selectedLesson: Lesson | null = null;
  lessonContent: SafeHtml = '';
  expandedTopics = new Set<number>();
  loading = true;

  constructor(
    private courseService: CourseService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.courseService.getCourse().subscribe({
      next: c => {
        this.course = c;
        this.loading = false;
        if (c.topics.length) {
          this.expandedTopics.add(c.topics[0].id);
          if (c.topics[0].lessons.length) {
            this.selectLesson(c.topics[0].lessons[0]);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  toggleTopic(topic: Topic) {
    if (this.expandedTopics.has(topic.id)) {
      this.expandedTopics.delete(topic.id);
    } else {
      this.expandedTopics.add(topic.id);
    }
    this.cdr.detectChanges();
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson = lesson;
    this.lessonContent = this.sanitizer.bypassSecurityTrustHtml(lesson.content);
    this.cdr.detectChanges();
  }

  goToAssignment() {
    if (this.selectedLesson?.assignment_id) {
      this.router.navigate(['/student/assignments', this.selectedLesson.assignment_id]);
    }
  }
}
