import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';
import { adminGuard, studentGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'student',
    canActivate: [studentGuard],
    children: [
      { path: 'course', loadComponent: () => import('./components/student/course/student-course.component').then(m => m.StudentCourseComponent) },
      { path: 'assignments', loadComponent: () => import('./components/student/assignments/student-assignments.component').then(m => m.StudentAssignmentsComponent) },
      { path: 'assignments/:id', loadComponent: () => import('./components/student/assignment-detail/assignment-detail.component').then(m => m.AssignmentDetailComponent) },
      { path: 'chat', loadComponent: () => import('./components/student/chat/student-chat.component').then(m => m.StudentChatComponent) },
      { path: 'news', loadComponent: () => import('./components/student/news/student-news.component').then(m => m.StudentNewsComponent) },
      { path: 'notifications', loadComponent: () => import('./components/student/notifications/student-notifications.component').then(m => m.StudentNotificationsComponent) },
      { path: 'profile', loadComponent: () => import('./components/student/profile/student-profile.component').then(m => m.StudentProfileComponent) },
      { path: '', redirectTo: 'course', pathMatch: 'full' },
    ]
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'course', loadComponent: () => import('./components/admin/course/admin-course.component').then(m => m.AdminCourseComponent) },
      { path: 'review', loadComponent: () => import('./components/admin/review/admin-review.component').then(m => m.AdminReviewComponent) },
      { path: 'students', loadComponent: () => import('./components/admin/students/admin-students.component').then(m => m.AdminStudentsComponent) },
      { path: 'students/:id', loadComponent: () => import('./components/admin/student-detail/admin-student-detail.component').then(m => m.AdminStudentDetailComponent) },
      { path: 'announcements', loadComponent: () => import('./components/admin/announcements/admin-announcements.component').then(m => m.AdminAnnouncementsComponent) },
      { path: 'settings', loadComponent: () => import('./components/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  { path: '**', redirectTo: '/login' }
];
